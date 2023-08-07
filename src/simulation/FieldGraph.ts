import DesignData, {
  ConnectionValue, GateValue, Layer, MetalValue, SiliconValue, ViaValue
} from '@/serialization/DesignData';
import { decodeSync, encodeSync } from '@/serialization';
import { Point } from '@/simulation/Point';
import { traceLine } from '@/utils/traceLine';

export type SiliconType = 'p' | 'n';
export type DrawType = 'metal' | 'p-silicon' | 'n-silicon' | 'via';

const drawTypeToLayer = {
  'metal': Layer.Metal,
  'p-silicon': Layer.Silicon,
  'n-silicon': Layer.Silicon,
  'via': Layer.Vias,
};

const drawTypeToConnectionLayerH = {
  'metal': Layer.MetalConnectionsH,
  'p-silicon': Layer.SiliconConnectionsH,
  'n-silicon': Layer.SiliconConnectionsH,
  'via': null,
};

const drawTypeToConnectionLayerV = {
  'metal': Layer.MetalConnectionsV,
  'p-silicon': Layer.SiliconConnectionsV,
  'n-silicon': Layer.SiliconConnectionsV,
  'via': null,
};

const drawTypeToValue = {
  'metal': MetalValue.Metal,
  'p-silicon': SiliconValue.PSilicon,
  'n-silicon': SiliconValue.NSilicon,
  'via': ViaValue.Via,
};

const drawTypeToValueNone = {
  'metal': MetalValue.None,
  'p-silicon': SiliconValue.None,
  'n-silicon': SiliconValue.None,
  'via': ViaValue.None,
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
    if (existing !== SiliconValue.None && existing !== val) {
      return;
    }
    data.set(Layer.Silicon, x, y, val);
    if (lastPoint) {
      const [ lastX, lastY ] = lastPoint;
      const lastValue = data.get(Layer.Silicon, lastX, lastY);
      if (lastValue !== SiliconValue.None && lastValue !== val) {
        return;
      }
      if (x !== lastX) {
        const minX = Math.min(x, lastX);
        data.set(Layer.SiliconConnectionsH, minX, y, ConnectionValue.Connected);
      }
      if (y !== lastY) {
        const minY = Math.min(y, lastY);
        data.set(Layer.SiliconConnectionsV, x, minY, ConnectionValue.Connected);
      }
    }
    // TODO gates
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
    if (type === 'metal') {
      let lastPoint: Point|undefined = undefined;
      for (const point of trace) {
        this.placeMetal(point, lastPoint);
        lastPoint = point;
      }
    } else if (type === 'p-silicon' || type === 'n-silicon') {
      let lastPoint: Point|undefined = undefined;
      for (const point of trace) {
        this.placeSilicon(type === 'p-silicon' ? 'p' : 'n', point, lastPoint);
        lastPoint = point;
      }
    } else {
      for (const point of trace) {
        this.placeVia(point);
      }
    }

/*
    const val = drawTypeToValue[type];
    const valEmpty = drawTypeToValueNone[type];
    const layerConnH = drawTypeToConnectionLayerH[type];
    const layerConnV = drawTypeToConnectionLayerV[type];
    let lastPoint: Point|null = null;
    for (const point of trace) {
      const [ col, row ] = point;
      const curVal = data.get(layer, col, row);
      if (curVal === valEmpty) {
        data.set(layer, col, row, val);
      }
      do {
        if (lastPoint) {
          const [ lastCol, lastRow ] = lastPoint;
          if (layerConnH && col !== lastCol) {
            const minCol = Math.min(col, lastCol);
            if (layer === Layer.Silicon && curVal !== valEmpty && curVal !== val) {
              const prev = data.get(layerConnH, minCol - 1, row);
              const center = data.get(layerConnH, minCol, row);
              const next = data.get(layerConnH, minCol + 1, row);
              if (prev === center && center === next) {
                data.set(Layer.GatesH, lastCol, row, GateValue.Gate);
              } else {
                break;
              }
            }
            data.set(layerConnH, minCol, row, ConnectionValue.Connected);
          }
          if (layerConnV && row !== lastRow) {
            const minRow = Math.min(row, lastRow);
            if (layer === Layer.Silicon && curVal !== valEmpty && curVal !== val) {
              const prev = data.get(layerConnV, col, minRow - 1);
              const center = data.get(layerConnV, col, minRow);
              const next = data.get(layerConnV, col, minRow + 1);
              if (prev === center && center === next) {
                data.set(Layer.GatesV, col, lastRow, GateValue.Gate);
              } else {
                break;
              }
            }
            data.set(layerConnV, col, minRow, ConnectionValue.Connected);
          }
        }
      } while (false);
      lastPoint = point;
    }
*/

  }

  public erase(types: DrawType|DrawType[], startPoint: Point, ...points: Point[]) {
    if (Array.isArray(types)) {
      types = Array.from(new Set(types));
    } else {
      types = [ types ];
    }
    if (types.length === 0)
      return;
    const trace = traceLine(startPoint, ...points);
    // TODO
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
