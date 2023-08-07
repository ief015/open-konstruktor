import DesignData, {
  ConnectionValue, GateValue, Layer, MetalValue, SiliconValue, ViaValue
} from '@/serialization/DesignData';
import { decodeSync, encodeSync } from '@/serialization';
import { Point } from '@/simulation/Point';
import { traceLine } from '@/utils/traceLine';

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

  public draw(type: DrawType, startPoint: Point, ...points: Point[]) {
    const { data } = this;
    const trace = traceLine(startPoint, ...points);
    const layer = drawTypeToLayer[type];
    if (layer === null) {
      throw new Error('Invalid draw type');
    }
    const val = drawTypeToValue[type];
    const valEmpty = drawTypeToValueNone[type];
    const layerConnH = drawTypeToConnectionLayerH[type];
    const layerConnV = drawTypeToConnectionLayerV[type];

    // TODO: metal and silicon if-blocks are fairly similar. could be refactored.
    if (type === 'metal') {

      let lastPoint: Point|null = null;
      for (const point of trace) {
        const [ x, y ] = point;
        data.set(layer, x, y, MetalValue.Metal);
        if (lastPoint) {
          const [ lastX, lastY ] = lastPoint;
          if (x !== lastX) {
            const minX = Math.min(x, lastX);
            data.set(layerConnH!, minX, y, ConnectionValue.Connected);
          }
          if (y !== lastY) {
            const minY = Math.min(y, lastY);
            data.set(layerConnV!, x, minY, ConnectionValue.Connected);
          }
        }
        lastPoint = point;
      }

    } else if (type === 'p-silicon' || type === 'n-silicon') {

    

    } else {

      for (const point of trace) {
        const [ x, y ] = point;
        const onSilicon = data.get(Layer.Silicon, x, y) !== SiliconValue.None;
        const onGateH = data.get(Layer.GatesH, x, y) !== GateValue.None;
        const onGateV = data.get(Layer.GatesV, x, y) !== GateValue.None;
        if (onSilicon && !onGateH && !onGateV) {
          data.set(layer, x, y, ViaValue.Via);
        }
      }

    }

/*
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
