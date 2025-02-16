import { Buffer } from 'node:buffer';

export type LayerColumn = number[];
export type DesignDataLayer = LayerColumn[];

export interface LayerDimensions {
  columns: number;
  rows: number;
};

export enum Layer {
  Silicon = 0,
  Metal = 1,
  GatesV = 2,
  GatesH = 3,
  Vias = 4,
  SiliconConnectionsH = 5,
  SiliconConnectionsV = 6,
  MetalConnectionsH = 7,
  MetalConnectionsV = 8,

  COUNT // Keep last
}

export enum SiliconValue {
  None = 0x00,
  NSilicon = 0x01,
  PSilicon = 0x02,
}

export enum MetalValue {
  None = 0x02,
  Metal = 0x03,
}

export enum GateValue {
  None = 0x02,
  Gate = 0x03,
}

export enum ViaValue {
  None = 0x02,
  Via = 0x03,
}

export enum ConnectionValue {
  None = 0x02,
  Connected = 0x03,
}

export class DesignData {
  protected layers: DesignDataLayer[] = [];
  protected dimensions: LayerDimensions;

  constructor(columns: number, rows: number);
  constructor(copy: DesignData);
  constructor(columns: number|DesignData, rows: number = 0) {
    if (columns instanceof DesignData) {
      const copy = columns;
      this.dimensions = { ...copy.dimensions };
      this.layers = copy.layers.map(layer => layer.map(column => [...column]));
    } else {
      this.dimensions = { columns, rows };
      this.rebuildLayers();
    }
  }

  protected rebuildLayers(): void {
    const { columns, rows } = this.dimensions;
    const layers: DesignDataLayer[] = [];
    for (let i = 0; i < Layer.COUNT; i++) {
      const layer: DesignDataLayer = [];
      for (let col = 0; col < columns; col++) {
        const column: LayerColumn = [];
        for (let row = 0; row < rows; row++) {
          column.push(i == 0 ? 0x00 : 0x02);
        }
        layer.push(column);
      }
      layers.push(layer);
    }
    this.layers.splice(0, this.layers.length, ...layers);
  }

  public getLayer(layer: Layer|number): DesignDataLayer {
    return this.layers[layer];
  }

  public getDimensions(): LayerDimensions {
    return this.dimensions;
  }

  public getLayers(): DesignDataLayer[] {
    return this.layers;
  }

  public get(layer: Layer|number, col: number, row: number): number {
    return this.layers[layer][col]?.[row];
  }

  public set(layer: Layer|number, col: number, row: number, value: number): void {
    if (col < 0 || col >= this.dimensions.columns)
      return;
    if (row < 0 || row >= this.dimensions.rows)
      return;
    this.layers[layer][col][row] = value;
  }

  public getDesignScore(): number {
    let score = 0;
    for (let x = 0; x < this.dimensions.columns; x++) {
      for (let y = 0; y < this.dimensions.rows; y++) {
        this.layers[Layer.Metal][x][y] === MetalValue.Metal && score++;
        this.layers[Layer.Silicon][x][y] !== SiliconValue.None && score++;
      }
    }
    return score;
  }

  public static from(data: Buffer): DesignData {
    const cols = data.readUInt8(1);
    const rows = data.readUInt8(3);
    let offset = 4;
    const design = new DesignData(cols, rows);
    for (let i = 0; i < Layer.COUNT; i++) {
      const layer = design.layers[i];
      if (
        data.readUInt8(offset++) != 0x09 ||
        data.readUInt8(offset++) != 0x59 ||
        data.readUInt8(offset++) != 0x01
      ) {
        throw new Error("Malformed design data (invalid layer marker)");
      }
      for (let col = 0; col < cols; col++) {
        const column = layer[col];
        if (
          data.readUInt8(offset++) != 0x09 ||
          data.readUInt8(offset++) != 0x37 ||
          data.readUInt8(offset++) != 0x01
        ) {
          throw new Error("Malformed design data (invalid column marker)");
        }
        for (let row = 0; row < rows; row++) {
          const val = data.readUInt8(offset + (i == Layer.Silicon ? 1 : 0))
          if (i == Layer.Metal) {
            if (val == 0x04) {
              // Compensate possible bug with metal layer during export from original game.
              // Replace `04 00` with `02`
              // See docs/save-strings.md#layer-2-metal
              column[row] = 0x02;
              offset += 2;
              continue;
            }
          }
          column[row] = val;
          offset += (i == 0 ? 2 : 1);
        }
      }
    }
    return design;
  }

  public toBuffer(): Buffer {
    const numLayers = this.layers.length;
    const { columns, rows } = this.dimensions;
    const szDimensions = 4;
    const szLayerMarkers = 3 * numLayers;
    const szLayer = (numLayers - 1) * columns * (rows + 3);
    const szLayerSilicon = columns * (rows * 2 + 3);
    const buf = Buffer.alloc(szDimensions + szLayerMarkers + szLayer + szLayerSilicon);
    let offset = 0;
    buf[offset++] = 0x04;
    buf[offset++] = columns;
    buf[offset++] = 0x04;
    buf[offset++] = rows;
    for (let i = 0; i < numLayers; i++) {
      const layer = this.layers[i];
      buf[offset++] = 0x09;
      buf[offset++] = 0x59;
      buf[offset++] = 0x01;
      for (let x = 0; x < columns; x++) {
        const column = layer[x];
        buf[offset++] = 0x09;
        buf[offset++] = 0x37;
        buf[offset++] = 0x01;
        for (let y = 0; y < rows; y++) {
          const row = column[y];
          if (i == Layer.Silicon) {
            buf[offset++] = 0x04;
          }
          buf[offset++] = row;
        }
      }
    }
    return buf;
  }

}
