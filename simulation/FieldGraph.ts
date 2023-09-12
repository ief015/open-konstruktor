import {
  DesignData, ConnectionValue, GateValue, Layer, LayerDimensions, MetalValue, SiliconValue, ViaValue
} from '@/serialization/DesignData';
import { decodeSync, encodeSync } from '@/serialization';
import { GraphLayer, Point } from '@/simulation';
import { traceLine } from '@/utils/traceLine';
import { traceRectBorder } from '@/utils/traceRectBorder';

export type SiliconType = 'p' | 'n';
export type DrawType = 'metal' | 'p-silicon' | 'n-silicon' | 'via';
export type EraseType = 'metal' | 'silicon' | 'via' | 'gate';
export type Direction = 'h' | 'v';

export interface PasteOptions {
  /**
   * Force overwriting data in destination graph.
   * Paste will always return true when enabled.
   * Default `false`.
   */
  overwrite?: boolean;
  /**
   * Includes the connection data around the border.
   * Default `false`.
   */
  includeBorderConnections?: boolean;
}

export interface QueryMetalResult {
  point: Point;
  direction: Direction;
}
export interface QuerySiliconResult {
  point: Point;
  type: SiliconType;
  direction: Direction;
}

export interface QueryResult {
  metal: boolean;
  metalConnections: QueryMetalResult[];
  silicon: SiliconType | false;
  siliconConnections: QuerySiliconResult[];
  via: boolean;
  gate: Direction | false;
}

const drawTypeToLayer = {
  'metal': Layer.Metal,
  'p-silicon': Layer.Silicon,
  'n-silicon': Layer.Silicon,
  'via': Layer.Vias,
};

export default class FieldGraph {

  private data: DesignData;
  private minDrawColumn;
  private maxDrawColumn;

  constructor(data: DesignData = new DesignData()) {
    this.data = data;
    const { columns } = this.data.getDimensions();
    const pinColumnWidth = 4;
    this.minDrawColumn = pinColumnWidth;
    this.maxDrawColumn = columns - pinColumnWidth - 1;
  }

  public getDimensions(): LayerDimensions {
    return this.data.getDimensions();
  }

  public getMinMaxColumns(): [ number, number ] {
    return [ this.minDrawColumn, this.maxDrawColumn ];
  }

  public getPinCount(): number {
    return this.data.getPinCount();
  }

  public getPinPoint(pin: number): Point {
    return this.data.getPinPoint(pin);
  }

  public getData(): Readonly<DesignData> {
    return this.data;
  }

  public getDesignScore(): number {
    return this.data.getDesignScore();
  }

  public isValidGateSpot(point: Point, direction: Direction): boolean {
    const { data } = this;
    const [ x, y ] = point;
    if (direction === 'h') {
      // Ensure valid vertical strip of silicon
      const prev = data.get(Layer.Silicon, x, y - 1);
      const center = data.get(Layer.Silicon, x, y);
      const next = data.get(Layer.Silicon, x, y + 1);
      if (prev !== center || center !== next)
        return false;
      if (data.get(Layer.SiliconConnectionsV, x, y) !== ConnectionValue.Connected)
        return false;
      if (data.get(Layer.SiliconConnectionsV, x, y - 1) !== ConnectionValue.Connected)
        return false;
      // Ensure no connected silicon of same type left or right of gate
      if (center === data.get(Layer.Silicon, x + 1, y)) {
        if (data.get(Layer.SiliconConnectionsH, x, y) === ConnectionValue.Connected) {
          return false;
        }
      }
      if (center === data.get(Layer.Silicon, x - 1, y)) {
        if (data.get(Layer.SiliconConnectionsH, x - 1, y) === ConnectionValue.Connected) {
          return false;
        }
      }
    } else {
      // Ensure valid horizontal strip of silicon
      const prev = data.get(Layer.Silicon, x - 1, y);
      const center = data.get(Layer.Silicon, x, y);
      const next = data.get(Layer.Silicon, x + 1, y);
      if (prev !== center || center !== next)
        return false;
      if (data.get(Layer.SiliconConnectionsH, x, y) !== ConnectionValue.Connected)
        return false;
      if (data.get(Layer.SiliconConnectionsH, x - 1, y) !== ConnectionValue.Connected)
        return false;
      // Ensure no connected silicon of same type above or below of gate
      if (center === data.get(Layer.Silicon, x, y + 1)) {
        if (data.get(Layer.SiliconConnectionsV, x, y) === ConnectionValue.Connected) {
          return false;
        }
      }
      if (center === data.get(Layer.Silicon, x, y - 1)) {
        if (data.get(Layer.SiliconConnectionsV, x, y - 1) === ConnectionValue.Connected) {
          return false;
        }
      }
    }
    return true;
  }

  public checkAndRemoveInvalidGate(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    if (data.get(Layer.GatesH, x, y) === GateValue.Gate) {
      const hasNoConns =
        data.get(Layer.SiliconConnectionsH, x, y) !== ConnectionValue.Connected &&
        data.get(Layer.SiliconConnectionsH, x - 1, y) !== ConnectionValue.Connected;
      if (hasNoConns || !this.isValidGateSpot(point, 'h')) {
        this.removeGate(point);
      }
    } else if (data.get(Layer.GatesV, x, y) === GateValue.Gate) {
      const hasNoConns =
        data.get(Layer.SiliconConnectionsV, x, y) !== ConnectionValue.Connected &&
        data.get(Layer.SiliconConnectionsV, x, y - 1) !== ConnectionValue.Connected;
      if (hasNoConns || !this.isValidGateSpot(point, 'v')) {
        this.removeGate(point);
      }
    }
  }

  public placeMetal(startPoint: Point, lastPoint?: Point) {
    const { data } = this;
    const [ x, y ] = startPoint;
    if (x >= this.minDrawColumn && x <= this.maxDrawColumn) {
      data.set(Layer.Metal, x, y, MetalValue.Metal);
    }
    if (lastPoint) {
      const [ lastX, lastY ] = lastPoint;
      if (x !== lastX) {
        const minX = Math.min(x, lastX);
        const validConnection =
          data.get(Layer.Metal, minX, y) === MetalValue.Metal &&
          data.get(Layer.Metal, minX + 1, y) === MetalValue.Metal;
        if (validConnection) {
          data.set(Layer.MetalConnectionsH, minX, y, ConnectionValue.Connected);
        }
      }
      if (y !== lastY) {
        const minY = Math.min(y, lastY);
        const validConnection =
          data.get(Layer.Metal, x, minY) === MetalValue.Metal &&
          data.get(Layer.Metal, x, minY + 1) === MetalValue.Metal;
        if (validConnection) {
          data.set(Layer.MetalConnectionsV, x, minY, ConnectionValue.Connected);
        }
      }
    }
  }

  public placeSilicon(type: SiliconType, startPoint: Point, lastPoint?: Point) {
    const { data } = this;
    const [ x, y ] = startPoint;
    const val = type === 'p' ? SiliconValue.PSilicon : SiliconValue.NSilicon;
    const existing = data.get(Layer.Silicon, x, y);
    const requestingGate = existing !== SiliconValue.None && existing !== val;
    if (existing === SiliconValue.None && x >= this.minDrawColumn && x <= this.maxDrawColumn) {
      data.set(Layer.Silicon, x, y, val);
    }
    if (lastPoint) {
      const [ lastX, lastY ] = lastPoint;
      const lastValue = data.get(Layer.Silicon, lastX, lastY);
      if (lastValue !== SiliconValue.None && lastValue !== val) {
        return;
      }
      if (existing === lastValue) {
        // Check if trying to connect to a gate of same silicon type
        if (this.queryGate([x, y]) || this.queryGate([lastX, lastY])) {
          return;
        }
      }
      if (x !== lastX) {
        const minX = Math.min(x, lastX);
        const validConnection =
          data.get(Layer.Silicon, minX, y) !== SiliconValue.None &&
          data.get(Layer.Silicon, minX + 1, y) !== SiliconValue.None;
        if (validConnection) {
          if (requestingGate) {
            // Horizontal gate
            if (this.isValidGateSpot([x, y], 'h')) {
              data.set(Layer.GatesH, x, y, GateValue.Gate);
              this.removeVia([x, y]);
            } else {
              return;
            }
          }
          data.set(Layer.SiliconConnectionsH, minX, y, ConnectionValue.Connected);
        }
      } else if (y !== lastY) {
        const minY = Math.min(y, lastY);
        const validConnection =
          data.get(Layer.Silicon, x, minY) !== SiliconValue.None &&
          data.get(Layer.Silicon, x, minY + 1) !== SiliconValue.None;
        if (validConnection) {
          if (requestingGate) {
            // Vertical gate
            if (this.isValidGateSpot([x, y], 'v')) {
              data.set(Layer.GatesV, x, y, GateValue.Gate);
              this.removeVia([x, y]);
            } else {
              return;
            }
          }
          data.set(Layer.SiliconConnectionsV, x, minY, ConnectionValue.Connected);
        }
      }
    }
  }

  public placeVia(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    const onSilicon = data.get(Layer.Silicon, x, y) !== SiliconValue.None;
    const onGateH = data.get(Layer.GatesH, x, y) !== GateValue.None;
    const onGateV = data.get(Layer.GatesV, x, y) !== GateValue.None;
    if (onSilicon && !onGateH && !onGateV) {
      data.set(Layer.Vias, x, y, ViaValue.Via);
    }
  }

  public draw(type: DrawType, startPoint: Point, ...points: Point[]) {
    const layer = drawTypeToLayer[type];
    if (layer === null) {
      throw new Error('Invalid draw type');
    }
    const { columns: width, rows: height} = this.data.getDimensions();
    const trace = traceLine(startPoint, ...points);
    let lastPoint: Point|undefined = undefined;
    for (const point of trace) {
      const [ x, y ] = point;
      if (x < 0 || y < 0 || x >= width || y >= height)
        continue;
      switch (type) {
        case 'metal':
          this.placeMetal(point, lastPoint);
          break;
        case 'p-silicon':
          this.placeSilicon('p', point, lastPoint);
          break;
        case 'n-silicon':
          this.placeSilicon('n', point, lastPoint);
          break;
        case 'via':
          this.placeVia(point);
          break;
      }
      lastPoint = point;
    }
  }

  public removeMetal(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    if (x < this.minDrawColumn || x > this.maxDrawColumn) {
      return;
    }
    if (data.get(Layer.Metal, x, y) === MetalValue.None) {
      return;
    }
    data.set(Layer.Metal, x, y, MetalValue.None);
    data.set(Layer.MetalConnectionsH, x, y, ConnectionValue.None);
    data.set(Layer.MetalConnectionsV, x, y, ConnectionValue.None);
    data.set(Layer.MetalConnectionsH, x - 1, y, ConnectionValue.None);
    data.set(Layer.MetalConnectionsV, x, y - 1, ConnectionValue.None);
  }

  public removeGate(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    if (data.get(Layer.GatesH, x, y) === GateValue.Gate) {
      data.set(Layer.GatesH, x, y, GateValue.None);
      data.set(Layer.SiliconConnectionsH, x, y, ConnectionValue.None);
      data.set(Layer.SiliconConnectionsH, x - 1, y, ConnectionValue.None);
    }
    if (data.get(Layer.GatesV, x, y) === GateValue.Gate) {
      data.set(Layer.GatesV, x, y, GateValue.None);
      data.set(Layer.SiliconConnectionsV, x, y, ConnectionValue.None);
      data.set(Layer.SiliconConnectionsV, x, y - 1, ConnectionValue.None);
    }
  }

  public removeSilicon(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    if (data.get(Layer.Silicon, x, y) === SiliconValue.None) {
      return;
    }
    if (x < this.minDrawColumn || x > this.maxDrawColumn) {
      return;
    }
    this.removeGate(point);
    data.set(Layer.Silicon, x, y, SiliconValue.None);
    data.set(Layer.Vias, x, y, ViaValue.None);
    if (data.get(Layer.SiliconConnectionsH, x, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsH, x, y, ConnectionValue.None);
      this.checkAndRemoveInvalidGate([x + 1, y]);
    }
    if (data.get(Layer.SiliconConnectionsV, x, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsV, x, y, ConnectionValue.None);
      this.checkAndRemoveInvalidGate([x, y + 1]);
    }
    if (data.get(Layer.SiliconConnectionsH, x - 1, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsH, x - 1, y, ConnectionValue.None);
      this.checkAndRemoveInvalidGate([x - 1, y]);
    }
    if (data.get(Layer.SiliconConnectionsV, x, y - 1) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsV, x, y - 1, ConnectionValue.None);
      this.checkAndRemoveInvalidGate([x, y - 1]);
    }
  }

  public removeVia(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    data.set(Layer.Vias, x, y, ViaValue.None);
  }

  public erase(types: EraseType|EraseType[], startPoint: Point, ...points: Point[]) {
    if (Array.isArray(types)) {
      types = Array.from(new Set(types));
    } else {
      types = [ types ];
    }
    if (types.length === 0)
      return;
    const trace = traceLine(startPoint, ...points);
    for (const point of trace) {
      for (const type of types) {
        switch (type) {
          case 'metal':
            this.removeMetal(point);
            break;
          case 'silicon':
            this.removeSilicon(point);
            break;
          case 'via':
            this.removeVia(point);
            break;
          case 'gate':
            this.removeGate(point);
            break;
        }
      }
    }
  }

  public queryMetalConnections(point: Point): QueryMetalResult[] {
    const { data } = this;
    const [ x, y ] = point;
    const connections: QueryMetalResult[] = [];
    const offsets: {
      dir: Direction,
      cx: number,
      cy: number,
      dx: number,
      dy: number,
    }[] = [
      { cx: 0,  cy: 0,  dx: 1,  dy: 0,  dir: 'h' },
      { cx: 0,  cy: 0,  dx: 0,  dy: 1,  dir: 'v' },
      { cx: -1, cy: 0,  dx: -1, dy: 0,  dir: 'h' },
      { cx: 0,  cy: -1, dx: 0,  dy: -1, dir: 'v' },
    ];
    for (const offset of offsets) {
      const { cx, cy, dx, dy, dir } = offset;
      const layer = dir === 'h' ? Layer.MetalConnectionsH : Layer.MetalConnectionsV;
      if (data.get(layer, x + cx, y + cy) === ConnectionValue.Connected) {
        const ax = x + dx;
        const ay = y + dy;
        const val = data.get(Layer.Metal, ax, ay);
        if (val === MetalValue.None) {
          throw new Error('Metal connection to none');
        }
        connections.push({
          direction: dir,
          point: [ ax, ay ],
        });
      }
    }
    return connections;
  }

  public querySiliconConnections(point: Point): QuerySiliconResult[] {
    const { data } = this;
    const [ x, y ] = point;
    const connections: QuerySiliconResult[] = [];
    const offsets: {
      dir: Direction,
      cx: number,
      cy: number,
      dx: number,
      dy: number,
    }[] = [
      { cx: 0,  cy: 0,  dx: 1,  dy: 0,  dir: 'h' },
      { cx: 0,  cy: 0,  dx: 0,  dy: 1,  dir: 'v' },
      { cx: -1, cy: 0,  dx: -1, dy: 0,  dir: 'h' },
      { cx: 0,  cy: -1, dx: 0,  dy: -1, dir: 'v' },
    ];
    for (const offset of offsets) {
      const { cx, cy, dx, dy, dir } = offset;
      const layer = dir === 'h' ? Layer.SiliconConnectionsH : Layer.SiliconConnectionsV;
      if (data.get(layer, x + cx, y + cy) === ConnectionValue.Connected) {
        const ax = x + dx;
        const ay = y + dy;
        const val = data.get(Layer.Silicon, ax, ay);
        if (val === SiliconValue.None) {
          throw new Error('Silicon connection to none');
        }
        connections.push({
          direction: dir,
          type: val === SiliconValue.PSilicon ? 'p' : 'n',
          point: [ ax, ay ],
        });
      }
    }
    return connections;
  }

  public queryGate(point: Point): Direction | false {
    const { data } = this;
    const [ x, y ] = point;
    return data.get(Layer.GatesH, x, y) === GateValue.Gate ? 'h' :
      data.get(Layer.GatesV, x, y) === GateValue.Gate ? 'v' :
      false;
  }

  public query(point: Point): QueryResult {
    const { data } = this;
    const [ x, y ] = point;
    const metal = data.get(Layer.Metal, x, y) === MetalValue.Metal;
    const siliconRaw = data.get(Layer.Silicon, x, y);
    const silicon = siliconRaw === SiliconValue.PSilicon ? 'p' :
      siliconRaw === SiliconValue.NSilicon ? 'n' :
      false;
    const via = data.get(Layer.Vias, x, y) === ViaValue.Via;
    const gate = this.queryGate(point);
    const metalConnections = this.queryMetalConnections(point);
    const siliconConnections = this.querySiliconConnections(point);
    return {
      metal,
      silicon,
      via,
      gate,
      metalConnections,
      siliconConnections,
    };
  }

  public clearRect(start: Point, end: Point) {
    const { data } = this;
    const [ x1, y1 ] = start;
    const [ x2, y2 ] = end;
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;
    for (let x = -1; x < width; x++) {
      const ax = x + x1;
      for (let y = -1; y < height; y++) {
        const ay = y + y1;
        if (x >= 0 && y >= 0) {
          data.set(Layer.Metal, ax, ay, MetalValue.None);
          data.set(Layer.Silicon, ax, ay, SiliconValue.None);
          data.set(Layer.Vias, ax, ay, ViaValue.None);
          data.set(Layer.GatesH, ax, ay, GateValue.None);
          data.set(Layer.GatesV, ax, ay, GateValue.None);
        }
        data.set(Layer.MetalConnectionsH, ax, ay, ConnectionValue.None);
        data.set(Layer.MetalConnectionsV, ax, ay, ConnectionValue.None);
        data.set(Layer.SiliconConnectionsH, ax, ay, ConnectionValue.None);
        data.set(Layer.SiliconConnectionsV, ax, ay, ConnectionValue.None);
      }
    }
    for (const p of traceRectBorder([ x1 - 1, y1 - 1 ], [ x2 + 1, y2 + 1 ])) {
      this.checkAndRemoveInvalidGate(p);
    }
  }

  public copy(start: Point, end: Point): FieldGraph {
    const { data } = this;
    const [ x1, y1 ] = start;
    const [ x2, y2 ] = end;
    const width = Math.abs(x2 - x1) + 2;
    const height = Math.abs(y2 - y1) + 2;
    const copy = new DesignData(width, height, 0);
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    for (let x = 0; x <= width; x++) {
      const ax = x + minX;
      for (let y = 0; y <= height; y++) {
        const ay = y + minY;
        if (x > 0 && y > 0) {
          copy.set(Layer.Metal, x, y, data.get(Layer.Metal, ax, ay));
          copy.set(Layer.Silicon, x, y, data.get(Layer.Silicon, ax, ay));
          copy.set(Layer.Vias, x, y, data.get(Layer.Vias, ax, ay));
          copy.set(Layer.GatesH, x, y, data.get(Layer.GatesH, ax, ay));
          copy.set(Layer.GatesV, x, y, data.get(Layer.GatesV, ax, ay));
        }
        copy.set(Layer.MetalConnectionsH, x, y, data.get(Layer.MetalConnectionsH, ax, ay));
        copy.set(Layer.MetalConnectionsV, x, y, data.get(Layer.MetalConnectionsV, ax, ay));
        copy.set(Layer.SiliconConnectionsH, x, y, data.get(Layer.SiliconConnectionsH, ax, ay));
        copy.set(Layer.SiliconConnectionsV, x, y, data.get(Layer.SiliconConnectionsV, ax, ay));
      }
    }
    const fieldCopy = new FieldGraph(copy);
    for (const p of traceRectBorder([ x1, y1 ], [ x2, y2 ])) {
      fieldCopy.checkAndRemoveInvalidGate(p);
    }
    return fieldCopy;
  }

  public canPaste(topLeft: Point, graph: FieldGraph): boolean {
    const { data: myData } = this;
    const { data: otherData } = graph;
    const { columns, rows } = otherData.getDimensions();
    const [ x1, y1 ] = topLeft;
    const [ x2, y2 ] = [ x1 + columns - 1, y1 + rows - 1 ];
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        if (myData.get(Layer.Metal, x, y) !== MetalValue.None) {
          if (otherData.get(Layer.Metal, x - x1, y - y1) !== MetalValue.None) {
            return false;
        } 
        }
        if (myData.get(Layer.Silicon, x, y) !== SiliconValue.None) {
          if (otherData.get(Layer.Silicon, x - x1, y - y1) !== SiliconValue.None) {
            return false;
          }
        }
      }
    }
    return true;
  }

  public paste(topLeft: Point, graph: FieldGraph, options: PasteOptions = {}): boolean {
    const {
      overwrite,
      includeBorderConnections,
    } = Object.assign({
      overwrite: false,
      includeBorderConnections: false,
    }, options);
    if (!overwrite && !this.canPaste(topLeft, graph)) {
      return false;
    }
    const { data: myData } = this;
    const { data: otherData } = graph;
    const { columns, rows } = otherData.getDimensions();
    const [ x1, y1 ] = topLeft;
    const [ x2, y2 ] = [ x1 + columns - 1, y1 + rows - 1 ];
    for (let x = x1; x <= x2; x++) {
      const ax = x - x1;
      for (let y = y1; y <= y2; y++) {
        const ay = y - y1;
        if (x >= this.minDrawColumn && x <= this.maxDrawColumn) {
          if (otherData.get(Layer.Metal, ax, ay) !== MetalValue.None) {
            myData.set(Layer.Metal, x, y, otherData.get(Layer.Metal, ax, ay));
          }
          if (otherData.get(Layer.Silicon, ax, ay) !== SiliconValue.None) {
            myData.set(Layer.Silicon, x, y, otherData.get(Layer.Silicon, ax, ay));
          }
          if (otherData.get(Layer.Vias, ax, ay) !== ViaValue.None) {
            myData.set(Layer.Vias, x, y, otherData.get(Layer.Vias, ax, ay));
          }
          if (otherData.get(Layer.GatesH, ax, ay) !== GateValue.None) {
            myData.set(Layer.GatesH, x, y, otherData.get(Layer.GatesH, ax, ay));
          }
          if (otherData.get(Layer.GatesV, ax, ay) !== GateValue.None) {
            myData.set(Layer.GatesV, x, y, otherData.get(Layer.GatesV, ax, ay));
          }
          if (x > x1 && x < x2 && y > y1 && y < y2) {
            if (otherData.get(Layer.MetalConnectionsH, ax, ay) !== ConnectionValue.None) {
              myData.set(Layer.MetalConnectionsH, x, y, otherData.get(Layer.MetalConnectionsH, ax, ay));
            }
            if (otherData.get(Layer.MetalConnectionsV, ax, ay) !== ConnectionValue.None) {
              myData.set(Layer.MetalConnectionsV, x, y, otherData.get(Layer.MetalConnectionsV, ax, ay));
            }
            if (otherData.get(Layer.SiliconConnectionsH, ax, ay) !== ConnectionValue.None) {
              myData.set(Layer.SiliconConnectionsH, x, y, otherData.get(Layer.SiliconConnectionsH, ax, ay));
            }
            if (otherData.get(Layer.SiliconConnectionsV, ax, ay) !== ConnectionValue.None) {
              myData.set(Layer.SiliconConnectionsV, x, y, otherData.get(Layer.SiliconConnectionsV, ax, ay));
            }
          }
        }
        if (includeBorderConnections) {
          if (x >= this.minDrawColumn - 1 && x <= this.maxDrawColumn) {
            if ((x == x1 || x == x2) && (y == y1 || y == y2)) {
              if (otherData.get(Layer.MetalConnectionsH, ax, ay) !== ConnectionValue.None) {
                if (myData.get(Layer.Metal, x - 1, y) !== MetalValue.None) {
                  myData.set(Layer.MetalConnectionsH, x, y, otherData.get(Layer.MetalConnectionsH, ax, ay));
                }
              }
              if (otherData.get(Layer.MetalConnectionsV, ax, ay) !== ConnectionValue.None) {
                if (myData.get(Layer.Metal, x, y - 1) !== MetalValue.None) {
                  myData.set(Layer.MetalConnectionsV, x, y, otherData.get(Layer.MetalConnectionsV, ax, ay));
                }
              }
              if (otherData.get(Layer.SiliconConnectionsH, ax, ay) !== ConnectionValue.None) {
                if (myData.get(Layer.Silicon, x - 1, y) !== SiliconValue.None) {
                  myData.set(Layer.SiliconConnectionsH, x, y, otherData.get(Layer.SiliconConnectionsH, ax, ay));
                }
              }
              if (otherData.get(Layer.SiliconConnectionsV, ax, ay) !== ConnectionValue.None) {
                if (myData.get(Layer.Silicon, x, y - 1) !== SiliconValue.None) {
                  myData.set(Layer.SiliconConnectionsV, x, y, otherData.get(Layer.SiliconConnectionsV, ax, ay));
                }
              }
            }
          }
        }
      }
    }
    return true;
  }

  public toSaveString(): string {
    return encodeSync(this.data);
  }

  public static from(saveString: string): FieldGraph;
  public static from(saveData: DesignData): FieldGraph;
  public static from(saveData: string|DesignData): FieldGraph {
    if (typeof saveData === 'string') {
      saveData = DesignData.from(decodeSync(saveData));
    }
    return new FieldGraph(saveData);
  }

}
