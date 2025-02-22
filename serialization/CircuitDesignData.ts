import { ConnectionValue, DesignData, Layer, MetalValue } from "@/serialization/DesignData";

export const DEFAULT_NUM_COLUMNS = 44;
export const DEFAULT_NUM_ROWS = 27;
export const DEFAULT_PIN_SIZE = 3;
export const DEFAULT_PIN_OFFSET_X = 1;
export const DEFAULT_PIN_OFFSET_Y = 2;
export const DEFAULT_PIN_GAP = 1;

export default class CircuitDesignData extends DesignData {

  protected pinCount: number;

  constructor(columns?: number, rows?: number, numPinRows?: number);
  constructor(data: CircuitDesignData);
  constructor(data: DesignData, numPinRows?: number);
  constructor(
    columns: number|DesignData|CircuitDesignData = DEFAULT_NUM_COLUMNS,
    rows: number = DEFAULT_NUM_ROWS,
    numPinRows: number = 6,
  ) {
    if (columns instanceof CircuitDesignData) {
      const data = columns;
      super(data);
      this.pinCount = data.pinCount;
    } else if (columns instanceof DesignData) {
      const data = columns;
      const numPinRows = rows;
      super(data);
      this.pinCount = numPinRows;
    } else {
      if (numPinRows > 0) {
        const minHeight = numPinRows * (DEFAULT_PIN_SIZE + 1) + 3;
        rows = Math.max(rows, minHeight);
      }
      super(columns, rows);
      this.pinCount = numPinRows * 2;
      this.rebuildPins();
    }
  }

  protected rebuildPins(): void {
    const { columns } = this.dimensions;
    const numPinRows = this.getPinRowsCount();
    const metalLayer = this.layers[Layer.Metal];
    const metalConnectionsHLayer = this.layers[Layer.MetalConnectionsH];
    const metalConnectionsVLayer = this.layers[Layer.MetalConnectionsV];
    for (let pin = 0; pin < numPinRows; pin++) {
      const row = (pin * DEFAULT_PIN_SIZE) + (pin * DEFAULT_PIN_GAP) + DEFAULT_PIN_OFFSET_Y;
      for (let x = 0; x < DEFAULT_PIN_SIZE; x++) {
        for (let y = 0; y < DEFAULT_PIN_SIZE; y++) {
          const left = DEFAULT_PIN_OFFSET_X;
          const right = columns - DEFAULT_PIN_OFFSET_X - DEFAULT_PIN_SIZE;
          metalLayer[left + x][row + y] = MetalValue.Metal;
          metalLayer[right + x][row + y] = MetalValue.Metal;
          if (x < DEFAULT_PIN_SIZE - 1) {
            metalConnectionsHLayer[left + x][row + y] = ConnectionValue.Connected;
            metalConnectionsHLayer[right + x][row + y] = ConnectionValue.Connected;
          }
          if (y < DEFAULT_PIN_SIZE - 1) {
            metalConnectionsVLayer[left + x][row + y] = ConnectionValue.Connected;
            metalConnectionsVLayer[right + x][row + y] = ConnectionValue.Connected;
          }
        }
      }
    }
  }

  public getPinCount(): number {
    return this.pinCount;
  }

  public getPinRowsCount(): number {
    return this.pinCount / 2;
  }

  public getPinPoint(pin: number): [ col: number, row: number ] {
    const { columns } = this.dimensions;
    const pinRow = Math.floor(pin / 2);
    const row = (pinRow * DEFAULT_PIN_SIZE) + (pinRow * DEFAULT_PIN_GAP) + DEFAULT_PIN_OFFSET_Y;
    const left = DEFAULT_PIN_OFFSET_X;
    const right = columns - DEFAULT_PIN_OFFSET_X - DEFAULT_PIN_SIZE;
    const col = pin % 2 == 0 ? left : right;
    return [ col, row ];
  }

  public getDesignScore(): number {
    const score = super.getDesignScore();
    const pinScore = DEFAULT_PIN_SIZE * DEFAULT_PIN_SIZE * this.pinCount;
    return score - pinScore;
  }

  public isKOHCTPYKTOPCompatible(): boolean {
    return this.layers.length == Layer.COUNT
      && this.dimensions.columns == DEFAULT_NUM_COLUMNS
      && this.dimensions.rows == DEFAULT_NUM_ROWS
      && this.pinCount === 12;
  }

  public static from(data: Buffer): CircuitDesignData {
    const design = new CircuitDesignData(super.from(data));
    // Find number of pins
    const { rows } = design.dimensions;
    for (let pin = 0, pinRows = 0; ; pin+=2) {
      const loc = design.getPinPoint(pin);
      design.layers[Layer.Metal][loc[0]][loc[1]] === MetalValue.Metal && pinRows++;
      if (loc[1] >= rows - 1) {
        design.pinCount = pinRows * 2;
        break;
      }
    }
    return design;
  }

}
