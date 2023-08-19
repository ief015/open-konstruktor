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

const NUM_LAYERS = 9;
const DEFAULT_NUM_COLUMNS = 44;
const DEFAULT_NUM_ROWS = 27;
const DEFAULT_PIN_SIZE = 3;
const DEFAULT_PIN_OFFSET_X = 1;
const DEFAULT_PIN_OFFSET_Y = 2;
const DEFAULT_PIN_GAP = 1;

export class DesignData {
  private layers: DesignDataLayer[] = [];
  private dimensions: LayerDimensions;
  private pinCount: number;

  constructor(
    dimensions: LayerDimensions = {
      columns: DEFAULT_NUM_COLUMNS,
      rows: DEFAULT_NUM_ROWS,
    },
    numPinRows: number = 6,
  ) {
    const { columns, rows } = dimensions;
    this.dimensions = { columns, rows };
    this.pinCount = numPinRows * 2;
    for (let i = 0; i < NUM_LAYERS; i++) {
      const layer: DesignDataLayer = [];
      for (let col = 0; col < columns; col++) {
        const column: LayerColumn = [];
        for (let row = 0; row < rows; row++) {
          column.push(i == 0 ? 0x00 : 0x02);
        }
        layer.push(column);
      }
      this.layers.push(layer);
    }
    // Set the default values for the pins
    const metalLayer = this.layers[Layer.Metal];
    const metalConnectionsHLayer = this.layers[Layer.MetalConnectionsH];
    const metalConnectionsVLayer = this.layers[Layer.MetalConnectionsV];
    for (let pin = 0; pin < numPinRows; pin++) {
      const row = (pin * DEFAULT_PIN_SIZE) + (pin * DEFAULT_PIN_GAP) + DEFAULT_PIN_OFFSET_Y;
      for (let x = 0; x < DEFAULT_PIN_SIZE; x++) {
        for (let y = 0; y < DEFAULT_PIN_SIZE; y++) {
          const left = DEFAULT_PIN_OFFSET_X;
          const right = columns - DEFAULT_PIN_OFFSET_X - DEFAULT_PIN_SIZE;
          metalLayer[left+x][row+y] = MetalValue.Metal;
          metalLayer[right+x][row+y] = MetalValue.Metal;
          if (x < DEFAULT_PIN_SIZE - 1) {
            metalConnectionsHLayer[left+x][row+y] = ConnectionValue.Connected;
            metalConnectionsHLayer[right+x][row+y] = ConnectionValue.Connected;
          }
          if (y < DEFAULT_PIN_SIZE - 1) {
            metalConnectionsVLayer[left+x][row+y] = ConnectionValue.Connected;
            metalConnectionsVLayer[right+x][row+y] = ConnectionValue.Connected;
          }
        }
      }
    }
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

  public getPinCount(): number {
    return this.pinCount;
  }

  public getPinPoint(pin: number): [ number, number ] {
    const { columns } = this.dimensions;
    const pinRow = Math.floor(pin / 2);
    const row = (pinRow * DEFAULT_PIN_SIZE) + (pinRow * DEFAULT_PIN_GAP) + DEFAULT_PIN_OFFSET_Y;
    const left = DEFAULT_PIN_OFFSET_X;
    const right = columns - DEFAULT_PIN_OFFSET_X - DEFAULT_PIN_SIZE;
    const col = pin % 2 == 0 ? left : right;
    return [ col, row ];
  }

  public get(layer: Layer|number, col: number, row: number): number {
    return this.layers[layer][col][row];
  }

  public set(layer: Layer|number, col: number, row: number, value: number): void {
    if (col < 0 || col >= this.dimensions.columns)
      return;
    if (row < 0 || row >= this.dimensions.rows)
      return;
    this.layers[layer][col][row] = value;
  }

  public isKOHCTPYKTOPCompatible(): boolean {
    return this.layers.length == NUM_LAYERS
      && this.dimensions.columns == DEFAULT_NUM_COLUMNS
      && this.dimensions.rows == DEFAULT_NUM_ROWS
      && this.pinCount === 12;
  }

  public getDesignScore(): number {
    let score = 0;
    for (let x = 0; x < this.dimensions.columns; x++) {
      for (let y = 0; y < this.dimensions.rows; y++) {
        this.layers[Layer.Metal][x][y] === MetalValue.Metal && score++;
        this.layers[Layer.Silicon][x][y] !== SiliconValue.None && score++;
      }
    }
    const pinScore = DEFAULT_PIN_SIZE * DEFAULT_PIN_SIZE * this.pinCount;
    return score - pinScore;
  }

  public static from(data: Buffer): DesignData {
    const cols = data.readUInt8(1);
    const rows = data.readUInt8(3);
    let offset = 4;
    const design = new DesignData({ columns: cols, rows: rows });
    for (let i = 0; i < NUM_LAYERS; i++) {
      const layer = design.layers[i];
      const layerMarker = data.readUInt8(offset++) - data.readUInt8(offset++) - data.readUInt8(offset++);
      if (layerMarker != 0x09 - 0x59 - 0x01) {
        throw new Error("Malformed design data (invalid layer marker)");
      }
      for (let col = 0; col < cols; col++) {
        const column = layer[col];
        const columnMarker = data.readUInt8(offset++) - data.readUInt8(offset++) - data.readUInt8(offset++);
        if (columnMarker != 0x09 - 0x37 - 0x01) {
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
