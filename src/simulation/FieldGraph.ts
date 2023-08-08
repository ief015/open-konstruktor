import DesignData, {
  ConnectionValue, GateValue, Layer, MetalValue, SiliconValue, ViaValue
} from '@/serialization/DesignData';
import { decodeSync, encodeSync } from '@/serialization';
import { Point } from '@/simulation/Point';
import { traceLine } from '@/utils/traceLine';
import { adjacentPoints } from '@/utils/adjacentPoints';

export type SiliconType = 'p' | 'n';
export type DrawType = 'metal' | 'p-silicon' | 'n-silicon' | 'via';
export type EraseType = 'metal' | 'silicon' | 'via';
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
  metalConnections: Point[];
  silicon: SiliconType | false;
  siliconConnections: QuerySiliconResult[];
  via: boolean;
  gate: boolean;
}

const drawTypeToLayer = {
  'metal': Layer.Metal,
  'p-silicon': Layer.Silicon,
  'n-silicon': Layer.Silicon,
  'via': Layer.Vias,
};

export default class FieldGraph {

  private data: DesignData;

  constructor() {
    this.data = new DesignData();
  }

  public placeMetal(startPoint: Point, lastPoint?: Point) {
    const { data } = this;
    const [ x, y ] = startPoint;
    data.set(Layer.Metal, x, y, MetalValue.Metal);
    if (lastPoint) {
      const [ lastX, lastY ] = lastPoint;
      if (x !== lastX) {
        const minX = Math.min(x, lastX);
        data.set(Layer.MetalConnectionsH, minX, y, ConnectionValue.Connected);
      }
      if (y !== lastY) {
        const minY = Math.min(y, lastY);
        data.set(Layer.MetalConnectionsV, x, minY, ConnectionValue.Connected);
      }
    }
  }

  public placeSilicon(type: SiliconType, startPoint: Point, lastPoint?: Point) {
    const { data } = this;
    const [ x, y ] = startPoint;
    const val = type === 'p' ? SiliconValue.PSilicon : SiliconValue.NSilicon;
    const existing = data.get(Layer.Silicon, x, y);
    const isGate = existing !== SiliconValue.None && existing !== val;
    if (existing === SiliconValue.None) {
      data.set(Layer.Silicon, x, y, val);
    }
    if (lastPoint) {
      const [ lastX, lastY ] = lastPoint;
      const lastValue = data.get(Layer.Silicon, lastX, lastY);
      if (lastValue !== SiliconValue.None && lastValue !== val) {
        return;
      }
      if (x !== lastX) {
        if (isGate) {
          // Horizontal gate
          const prev = data.get(Layer.Silicon, x, y - 1);
          const center = data.get(Layer.Silicon, x, y);
          const next = data.get(Layer.Silicon, x, y + 1);
          if (prev === center && center === next) {
            data.set(Layer.GatesH, x, y, GateValue.Gate);
          } else {
            return;
          }
        }
        const minX = Math.min(x, lastX);
        data.set(Layer.SiliconConnectionsH, minX, y, ConnectionValue.Connected);
      } else if (y !== lastY) {
        if (isGate) {
          // Vertical gate
          const prev = data.get(Layer.Silicon, x - 1, y);
          const center = data.get(Layer.Silicon, x, y);
          const next = data.get(Layer.Silicon, x + 1, y);
          if (prev === center && center === next) {
            data.set(Layer.GatesV, x, y, GateValue.Gate);
          } else {
            return;
          }
        }
        const minY = Math.min(y, lastY);
        data.set(Layer.SiliconConnectionsV, x, minY, ConnectionValue.Connected);
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
    const trace = traceLine(startPoint, ...points);
    const layer = drawTypeToLayer[type];
    if (layer === null) {
      throw new Error('Invalid draw type');
    }
    let lastPoint: Point|undefined = undefined;
    for (const point of trace) {
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
    this.removeGate(point);
    data.set(Layer.Silicon, x, y, SiliconValue.None);
    data.set(Layer.Vias, x, y, ViaValue.None);
    if (data.get(Layer.SiliconConnectionsH, x, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsH, x, y, ConnectionValue.None);
      this.removeGate([ x + 1, y ]);
    }
    if (data.get(Layer.SiliconConnectionsV, x, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsV, x, y, ConnectionValue.None);
      this.removeGate([ x, y + 1 ]);
    }
    if (data.get(Layer.SiliconConnectionsH, x - 1, y) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsH, x - 1, y, ConnectionValue.None);
      this.removeGate([ x - 1, y ]);
    }
    if (data.get(Layer.SiliconConnectionsV, x, y - 1) === ConnectionValue.Connected) {
      data.set(Layer.SiliconConnectionsV, x, y - 1, ConnectionValue.None);
      this.removeGate([ x, y - 1 ]);
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
        }
      }
    }
  }

  public queryMetalConnections(point: Point): Point[] {

  }

  public querySiliconConnections(point: Point): QuerySiliconResult[] {
    const { data } = this;
    const [ x, y ] = point;
    const connections: QuerySiliconResult[] = [];
    if (data.get(Layer.SiliconConnectionsH, x, y) === ConnectionValue.Connected) {
      connections.push({
        direction: 'h',
        type: data.get(Layer.Silicon, x, y) === SiliconValue.PSilicon ? 'p' : 'n',
        gate: data.get(Layer.GatesH, x, y) === GateValue.Gate,
      });
    }
    if (data.get(Layer.SiliconConnectionsV, x, y) === ConnectionValue.Connected) {
      connections.push({
        direction: 'v',
        type: data.get(Layer.Silicon, x, y) === SiliconValue.PSilicon ? 'p' : 'n',
        gate: data.get(Layer.GatesV, x, y) === GateValue.Gate,
      });
    }
    return connections;
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
    const gate = data.get(Layer.GatesH, x, y) === GateValue.Gate ||
      data.get(Layer.GatesV, x, y) === GateValue.Gate;
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
    const graph = new FieldGraph();
    graph.data = saveData;
    return graph;
  }

}
