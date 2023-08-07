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
        case 'n-silicon':
          this.placeSilicon(type === 'p-silicon' ? 'p' : 'n', point, lastPoint);
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

  public removeSilicon(point: Point) {
    const { data } = this;
    const [ x, y ] = point;
    if (data.get(Layer.Silicon, x, y) === SiliconValue.None) {
      return;
    }
    data.set(Layer.Silicon, x, y, SiliconValue.None);
    data.set(Layer.Vias, x, y, ViaValue.None);
    data.set(Layer.SiliconConnectionsH, x, y, ConnectionValue.None);
    data.set(Layer.SiliconConnectionsV, x, y, ConnectionValue.None);
    data.set(Layer.SiliconConnectionsH, x - 1, y, ConnectionValue.None);
    data.set(Layer.SiliconConnectionsV, x, y - 1, ConnectionValue.None);
    data.set(Layer.GatesH, x, y, GateValue.None);
    data.set(Layer.GatesV, x, y, GateValue.None);
    // Remove adjacent gates
    for (const adjacent of adjacentPoints(point)) {
      const [ ax, ay ] = adjacent;
      if (data.get(Layer.GatesH, ax, ay) === GateValue.Gate) {
        data.set(Layer.GatesH, ax, ay, GateValue.None);
        data.set(Layer.SiliconConnectionsH, ax, ay, ConnectionValue.None);
        data.set(Layer.SiliconConnectionsH, ax - 1, ay, ConnectionValue.None);
      }
      if (data.get(Layer.GatesV, ax, ay) === GateValue.Gate) {
        data.set(Layer.GatesV, ax, ay, GateValue.None);
        data.set(Layer.SiliconConnectionsV, ax, ay, ConnectionValue.None);
        data.set(Layer.SiliconConnectionsV, ax, ay - 1, ConnectionValue.None);
      }
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
