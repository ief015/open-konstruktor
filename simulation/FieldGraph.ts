import {
  DesignData, ConnectionValue, GateValue, Layer, LayerDimensions, MetalValue, SiliconValue, ViaValue
} from '@/serialization/DesignData';
import { decodeSync, encodeSync } from '@/serialization';
import { GraphLayer, Point } from '@/simulation';
import { traceLine } from '@/utils/traceLine';

export type SiliconType = 'p' | 'n';
export type DrawType = 'metal' | 'p-silicon' | 'n-silicon' | 'via';
export type EraseType = 'metal' | 'silicon' | 'via' | 'gate';
export type Direction = 'h' | 'v';

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
