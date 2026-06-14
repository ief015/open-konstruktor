import type IDrawable from '@/render/IDrawable';
import {
  GateValue,
  Layer,
  MetalValue,
  SiliconValue,
  ViaValue,
} from '@/serialization';

export type GridDefinition = {
  columns: number;
  rows: number;
  boundaryLeft: number;
  boundaryRight: number;
  boundaryTop: number;
  boundaryBottom: number;
};

export type GridTheme = {
  outerBackgroundColor: string;
  innerBackgroundColor: string;
  boundaryColor: string;
  borderColor: string;
  gridLineColor: string;
};

export type GridViewport = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export class BackgroundGridRenderer implements IDrawable {
  protected static readonly TILE_SIZE = 13;
  protected canvas: HTMLCanvasElement | null = null;
  protected definition: GridDefinition;
  protected theme: GridTheme;

  /**
   * @param field Field to render
   * @param network If provided, rendering will include 'hot' layers.
   */
  constructor(
    canvas: HTMLCanvasElement,
    definition?: GridDefinition,
    theme?: Partial<GridTheme>,
  ) {
    this.canvas = canvas;
    this.definition = Object.assign(
      {
        columns: 0,
        rows: 0,
        boundaryLeft: 0,
        boundaryRight: 0,
        boundaryTop: 0,
        boundaryBottom: 0,
      },
      definition,
    );
    this.theme = Object.assign(
      {
        outerBackgroundColor: '#959595',
        innerBackgroundColor: '#959595',
        boundaryColor: `rgba(0,0,0,${20 / 255})`,
        borderColor: '#000',
        gridLineColor: '#818181',
      },
      theme,
    );
  }

  public setCanvas(canvas: HTMLCanvasElement): BackgroundGridRenderer {
    this.canvas = canvas;
    return this;
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    const ctx = this.canvas?.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    return ctx;
  }

  public applyDefinition(
    definition: Partial<GridDefinition>,
  ): BackgroundGridRenderer {
    Object.assign(this.definition, definition);
    return this;
  }

  public getDefinition(): Readonly<GridDefinition> {
    return this.definition;
  }

  public applyTheme(theme: Partial<GridTheme>): BackgroundGridRenderer {
    Object.assign(this.theme, theme);
    return this;
  }

  public getTheme(): Readonly<GridTheme> {
    return this.theme;
  }

  public render(viewport?: GridViewport): void {
    const ctx = this.canvas?.getContext('2d');
    if (!ctx) throw new Error('Could not get background canvas context');
    const {
      columns,
      rows,
      boundaryLeft,
      boundaryRight,
      boundaryTop,
      boundaryBottom,
    } = this.definition;
    const { left, top, right, bottom } = viewport || {
      left: 0,
      top: 0,
      right: columns - 1,
      bottom: rows - 1,
    };
    const TILE_SIZE = BackgroundGridRenderer.TILE_SIZE;
    // Outer background colour
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = this.theme.outerBackgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    // Inner background colour
    ctx.fillStyle = this.theme.innerBackgroundColor;
    ctx.fillRect(0, 0, columns * TILE_SIZE, rows * TILE_SIZE);
    // Draw grid lines
    ctx.save();
    {
      ctx.translate(0.5, 0.5);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.theme.gridLineColor;
      ctx.beginPath();
      for (let x = left; x <= right; x++) {
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, rows * TILE_SIZE);
      }
      for (let y = top; y <= bottom; y++) {
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(columns * TILE_SIZE, y * TILE_SIZE);
      }
      ctx.stroke();
    }
    ctx.restore();
    // Draw pin column boundaries
    ctx.fillStyle = this.theme.boundaryColor;
    ctx.fillRect(0, 0, boundaryLeft * TILE_SIZE + 1, rows * TILE_SIZE + 1);
    ctx.fillRect(
      (columns - boundaryRight + 1) * TILE_SIZE,
      0,
      (boundaryRight - 1) * TILE_SIZE,
      rows * TILE_SIZE,
    );
    /*
    // TODO: Draw pin row boundaries
    ctx.fillRect(0, 0, columns * TILE_SIZE + 1, boundaryTop * TILE_SIZE + 1);
    ctx.fillRect(
      0,
      (boundaryBottom + 1) * TILE_SIZE,
      columns * TILE_SIZE + 1,
      (rows - boundaryBottom - 1) * TILE_SIZE,
    );
    */
    // Draw border
    ctx.strokeStyle = this.theme.borderColor;
    ctx.strokeRect(0.5, 0.5, columns * TILE_SIZE, rows * TILE_SIZE);
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;
    this.canvas && ctx.drawImage(this.canvas, 0, 0, width, height);
  }
}
