import type IDrawable from '@/render/IDrawable';
import {
  GateValue,
  Layer,
  MetalValue,
  SiliconValue,
  ViaValue,
} from '@/serialization';
import { GateNode, PathNode, FieldGraph, Network } from '@/simulation';

export type TileBounds = [
  left: number,
  top: number,
  right: number,
  bottom: number,
];

type FieldRendererCanvasProvider = {
  silicon: HTMLCanvasElement;
  siliconHot?: HTMLCanvasElement;
  metal: HTMLCanvasElement;
  metalHot?: HTMLCanvasElement;
};

export class FieldRenderer implements IDrawable {
  public static readonly TILE_SIZE = 13;

  protected field: FieldGraph | null;
  protected network: Network | null;
  protected canvases = {
    silicon: null as HTMLCanvasElement | null,
    siliconHot: null as HTMLCanvasElement | null,
    metal: null as HTMLCanvasElement | null,
    metalHot: null as HTMLCanvasElement | null,
  };

  /**
   * Number of tiles outside the given rendering bounds to include for rendering.
   * @default 2
   */
  public edgeBuffer: number = 2;

  /**
   * @param field Field to render
   * @param network If provided, rendering will include 'hot' layers.
   */
  constructor();
  constructor(field: FieldGraph);
  constructor(field: FieldGraph, canvas: HTMLCanvasElement);
  constructor(field: FieldGraph, canvases: FieldRendererCanvasProvider);
  constructor(field: FieldGraph, network: Network, canvas: HTMLCanvasElement);
  constructor(
    field: FieldGraph,
    network: Network,
    canvases: FieldRendererCanvasProvider,
  );
  constructor(
    field?: FieldGraph,
    networkOrCanvas?: Network | HTMLCanvasElement | FieldRendererCanvasProvider,
    networkOrCanvas2?: HTMLCanvasElement | FieldRendererCanvasProvider,
  ) {
    const network =
      networkOrCanvas instanceof Network ? networkOrCanvas : undefined;
    const canvas =
      networkOrCanvas instanceof HTMLCanvasElement
        ? networkOrCanvas
        : networkOrCanvas2 instanceof HTMLCanvasElement
          ? networkOrCanvas2
          : undefined;
    const canvases =
      networkOrCanvas instanceof Object && 'silicon' in networkOrCanvas
        ? networkOrCanvas
        : networkOrCanvas2 instanceof Object && 'silicon' in networkOrCanvas2
          ? networkOrCanvas2
          : undefined;
    this.field = field ?? null;
    this.network = network ?? null;
    if (canvas) {
      this.canvases.silicon = canvas;
      this.canvases.metal = canvas;
      this.canvases.siliconHot = canvas;
      this.canvases.metalHot = canvas;
    } else if (canvases) {
      this.canvases.silicon = canvases.silicon;
      this.canvases.siliconHot =
        canvases.siliconHot ?? (network ? canvases.silicon : null);
      this.canvases.metal = canvases.metal;
      this.canvases.metalHot =
        canvases.metalHot ?? (network ? canvases.metal : null);
    }
  }

  public setField(field: FieldGraph): FieldRenderer {
    this.field = field;
    return this;
  }

  public getField(): FieldGraph | null {
    return this.field;
  }

  public setNetwork(network: Network): FieldRenderer {
    this.network = network;
    return this;
  }

  public getNetwork(): Network | null {
    return this.network;
  }

  public getCanvases() {
    return this.canvases;
  }

  public getContext(
    key: keyof FieldRendererCanvasProvider,
  ): CanvasRenderingContext2D {
    const ctx = this.canvases[key]?.getContext('2d');
    if (!ctx) throw new Error(`Could not get canvas context for key: ${key}`);
    return ctx;
  }

  public setCanvas(canvas: HTMLCanvasElement): FieldRenderer {
    this.canvases.silicon = canvas;
    this.canvases.metal = canvas;
    this.canvases.siliconHot = canvas;
    this.canvases.metalHot = canvas;
    return this;
  }

  public applyCanvases(
    canvases: Partial<FieldRendererCanvasProvider>,
  ): FieldRenderer {
    Object.assign(this.canvases, canvases);
    return this;
  }

  public clear(
    options: {
      metal?: boolean;
      silicon?: boolean;
      metalHot?: boolean;
      siliconHot?: boolean;
      bounds?: TileBounds;
    } = {},
  ) {
    const {
      metal = false,
      silicon = false,
      metalHot = false,
      siliconHot = false,
      bounds,
    } = options;
    const contexts = [
      ...(metal ? [this.canvases.metal?.getContext('2d')] : []),
      ...(silicon ? [this.canvases.silicon?.getContext('2d')] : []),
      ...(metalHot && this.canvases.metalHot
        ? [this.canvases.metalHot.getContext('2d')]
        : []),
      ...(siliconHot && this.canvases.siliconHot
        ? [this.canvases.siliconHot.getContext('2d')]
        : []),
    ].filter((c): c is CanvasRenderingContext2D => !!c);
    if (contexts.length === 0) {
      return;
    }
    if (bounds) {
      const [left, top, right, bottom] = bounds;
      const width = (right - left + 1) * FieldRenderer.TILE_SIZE;
      const height = (bottom - top + 1) * FieldRenderer.TILE_SIZE;
      for (const ctx of contexts) {
        ctx.clearRect(
          left * FieldRenderer.TILE_SIZE + 1,
          top * FieldRenderer.TILE_SIZE + 1,
          width,
          height,
        );
      }
    } else {
      for (const ctx of contexts) {
        ctx.save();
        ctx.resetTransform();
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.restore();
      }
    }
  }

  protected renderBase(
    options: {
      field?: FieldGraph;
      metal?: boolean;
      silicon?: boolean;
      bounds?: TileBounds;
      noClear?: boolean;
    } = {},
  ) {
    const ctxMetal = this.canvases.metal?.getContext('2d');
    const ctxSilicon = this.canvases.silicon?.getContext('2d');
    if (!ctxMetal) throw new Error('Could not get metal canvas context');
    if (!ctxSilicon) throw new Error('Could not get silicon canvas context');
    const field = options.field ?? this.field;
    if (!field) throw new Error('No field to render');
    const dimensions = field.getDimensions();
    const data = field.getData();
    const { metal = false, silicon = false, bounds, noClear = false } = options;
    let [left, top, right, bottom] = bounds ?? [
      0,
      0,
      dimensions.columns,
      dimensions.rows,
    ];
    left = Math.max(0, left - this.edgeBuffer);
    top = Math.max(0, top - this.edgeBuffer);
    right = Math.min(dimensions.columns - 1, right + this.edgeBuffer);
    bottom = Math.min(dimensions.rows - 1, bottom + this.edgeBuffer);
    if (!noClear) {
      this.clear({
        metal,
        silicon,
        bounds: bounds ? [left, top, right, bottom] : undefined,
      });
    }
    const images = useImageLoader();
    if (silicon) {
      const ctx = ctxSilicon;
      const { renderTile, getDirectionX, getDirectionY } = useTileRenderer(ctx);
      const siliconLayer = data.getLayer(Layer.Silicon);
      const siliconConnHLayer = data.getLayer(Layer.SiliconConnectionsH);
      const siliconConnVLayer = data.getLayer(Layer.SiliconConnectionsV);
      const gatesHLayer = data.getLayer(Layer.GatesH);
      const gatesVLayer = data.getLayer(Layer.GatesV);
      const viaLayer = data.getLayer(Layer.Vias);
      const viaImage = images.findImage('/tiles/link.png');
      ctx.save();
      ctx.translate(
        left * FieldRenderer.TILE_SIZE + 1,
        top * FieldRenderer.TILE_SIZE + 1,
      );
      // Silicon layer + vias
      for (let col = left; col <= right; col++) {
        ctx.save();
        for (let row = top; row <= bottom; row++) {
          const st = siliconLayer[col][row];
          if (st === SiliconValue.PSilicon) {
            const xdir = getDirectionX(siliconConnHLayer, col, row);
            const ydir = getDirectionY(siliconConnVLayer, col, row);
            if (gatesHLayer[col][row] === GateValue.Gate) {
              renderTile(TileType.PGateH, xdir, ydir);
            } else if (gatesVLayer[col][row] === GateValue.Gate) {
              renderTile(TileType.PGateV, xdir, ydir);
            } else {
              renderTile(TileType.PSilicon, xdir, ydir);
            }
          } else if (st === SiliconValue.NSilicon) {
            const xdir = getDirectionX(siliconConnHLayer, col, row);
            const ydir = getDirectionY(siliconConnVLayer, col, row);
            if (gatesHLayer[col][row] === GateValue.Gate) {
              renderTile(TileType.NGateH, xdir, ydir);
            } else if (gatesVLayer[col][row] === GateValue.Gate) {
              renderTile(TileType.NGateV, xdir, ydir);
            } else {
              renderTile(TileType.NSilicon, xdir, ydir);
            }
          }
          if (viaLayer[col][row] === ViaValue.Via) {
            ctx.drawImage(viaImage, 0, 0);
          }
          ctx.translate(0, FieldRenderer.TILE_SIZE);
        }
        ctx.restore();
        ctx.translate(FieldRenderer.TILE_SIZE, 0);
      }
      ctx.restore();
    }
    if (metal) {
      const ctx = ctxMetal;
      const { renderTile, getDirectionX, getDirectionY } = useTileRenderer(ctx);
      const metalLayer = data.getLayer(Layer.Metal);
      const metalConnHLayer = data.getLayer(Layer.MetalConnectionsH);
      const metalConnVLayer = data.getLayer(Layer.MetalConnectionsV);
      ctx.save();
      ctx.translate(
        left * FieldRenderer.TILE_SIZE + 1,
        top * FieldRenderer.TILE_SIZE + 1,
      );
      for (let col = left; col <= right; col++) {
        ctx.save();
        for (let row = top; row <= bottom; row++) {
          if (metalLayer[col][row] === MetalValue.Metal) {
            const xdir = getDirectionX(metalConnHLayer, col, row);
            const ydir = getDirectionY(metalConnVLayer, col, row);
            renderTile(TileType.Metal, xdir, ydir);
          }
          ctx.translate(0, FieldRenderer.TILE_SIZE);
        }
        ctx.restore();
        ctx.translate(FieldRenderer.TILE_SIZE, 0);
      }
      ctx.restore();
    }
  }

  protected renderHot(
    options: {
      field?: FieldGraph;
      network?: Network;
      metal?: boolean;
      silicon?: boolean;
      bounds?: TileBounds;
      noClear?: boolean;
    } = {},
  ) {
    const net = options.network ?? this.network;
    if (!net) {
      console.warn('renderHot called with no network provided');
      return;
    }
    const ctxMetalHot = this.canvases.metalHot?.getContext('2d');
    const ctxSiliconHot = this.canvases.siliconHot?.getContext('2d');
    if (!ctxMetalHot) throw new Error('Could not get metal-hot canvas context');
    if (!ctxSiliconHot)
      throw new Error('Could not get silicon-hot canvas context');
    const field = options.field ?? this.field;
    const dimensions = field?.getDimensions();
    const { metal = false, silicon = false, bounds, noClear = false } = options;
    if (!metal && !silicon) return;
    const [left, top, right, bottom] = bounds ?? [
      0,
      0,
      dimensions?.columns ?? 0,
      dimensions?.rows ?? 0,
    ];
    const images = useImageLoader();
    const imgHot = images.findImage('/tiles/hot.png');
    if (!noClear) {
      this.clear({ metalHot: metal, siliconHot: silicon, bounds });
    }
    ctxMetalHot.save();
    ctxSiliconHot.save();
    ctxMetalHot.translate(1, 1);
    ctxSiliconHot.translate(1, 1);
    for (let col = left; col <= right; col++) {
      const x = col * FieldRenderer.TILE_SIZE;
      for (let row = top; row <= bottom; row++) {
        const y = row * FieldRenderer.TILE_SIZE;
        if (silicon) {
          const nodes = net.getNodesAt([col, row], 'silicon');
          const hot = nodes.some((n) => {
            if (n instanceof PathNode) {
              return n.state;
            } else if (n instanceof GateNode) {
              const open = n.isNPN ? n.active : !n.active;
              return open && n.gatedPaths.some((p) => p.state);
            }
            return false;
          });
          if (hot) {
            ctxSiliconHot.drawImage(imgHot, x, y);
          }
        }
        if (metal) {
          const nodes = net.getNodesAt([col, row], 'metal');
          const hot = nodes.some((n) => {
            if (n instanceof PathNode) {
              return n.state;
            }
            return false;
          });
          if (hot) {
            ctxMetalHot.drawImage(imgHot, x, y);
          }
        }
      }
    }
    ctxMetalHot.restore();
    ctxSiliconHot.restore();
  }

  public render(
    options: {
      field?: FieldGraph;
      network?: Network;
      metal?: boolean;
      silicon?: boolean;
      metalHot?: boolean;
      siliconHot?: boolean;
      bounds?: TileBounds;
      noClear?: boolean;
    } = {},
  ) {
    const {
      field = this.field ?? undefined,
      network = this.network ?? undefined,
      metal = false,
      silicon = false,
      metalHot = false,
      siliconHot = false,
      bounds,
      noClear = false,
    } = options;
    if (metal || silicon) {
      this.renderBase({ field, metal, silicon, bounds, noClear });
    }
    if (metalHot || siliconHot) {
      this.renderHot({
        field,
        network,
        metal: metalHot,
        silicon: siliconHot,
        bounds,
        noClear,
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;
    this.canvases.silicon &&
      ctx.drawImage(this.canvases.silicon, 0, 0, width, height);
    this.canvases.siliconHot &&
      ctx.drawImage(this.canvases.siliconHot, 0, 0, width, height);
    this.canvases.metal &&
      ctx.drawImage(this.canvases.metal, 0, 0, width, height);
    this.canvases.metalHot &&
      ctx.drawImage(this.canvases.metalHot, 0, 0, width, height);
  }
}
