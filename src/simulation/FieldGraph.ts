import DesignData, { ConnectionValue, GateValue, Layer, MetalValue, SiliconValue, ViaValue } from '@/serialization/DesignData';
import { decodeSync } from '@/serialization/decode';
import { encodeSync } from '@/serialization/encode';
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
    const trace = traceLine(startPoint, ...points);
    const layer = drawTypeToLayer[type];
    if (layer === null) {
      throw new Error('Invalid draw type');
    }
    const val = drawTypeToValue[type];
    const nonVal = drawTypeToValueNone[type];
    const connectionLayerH = drawTypeToConnectionLayerH[type];
    const connectionLayerV = drawTypeToConnectionLayerV[type];
    let lastPoint: Point|null = null;
    for (const point of trace) {
      const [ col, row ] = point;
      const curVal = this.data.get(layer, col, row);
      if (curVal === nonVal) {
        this.data.set(layer, col, row, val);
      }
      if (lastPoint) {
        const [ lastCol, lastRow ] = lastPoint;
        if (connectionLayerH && col !== lastCol) {
          const minCol = Math.min(col, lastCol);
          if (layer === Layer.Silicon && curVal !== nonVal && curVal !== val) {
            const prev = this.data.get(connectionLayerH, minCol - 1, row);
            const center = this.data.get(connectionLayerH, minCol, row);
            const next = this.data.get(connectionLayerH, minCol + 1, row);
            if (prev === center && center === next) {
              this.data.set(Layer.GatesH, lastCol, row, GateValue.Gate);
            }
          }
          this.data.set(connectionLayerH, minCol, row, ConnectionValue.Connected);
        }
        if (connectionLayerV && row !== lastRow) {
          const minRow = Math.min(row, lastRow);
          if (layer === Layer.Silicon && curVal !== nonVal && curVal !== val) {
            const prev = this.data.get(connectionLayerV, col, minRow - 1);
            const center = this.data.get(connectionLayerV, col, minRow);
            const next = this.data.get(connectionLayerV, col, minRow + 1);
            if (prev === center && center === next) {
              this.data.set(Layer.GatesH, col, lastRow, GateValue.Gate);
            }
          }
          this.data.set(connectionLayerV, col, minRow, ConnectionValue.Connected);
        }
      }
      lastPoint = point;
    }
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
