<template>
  <div class="relative w-full h-full">
    <canvas
      ref="canvasBackground"
      class="absolute w-full h-full"
    />
    <canvas
      ref="canvasSiliconTiles"
      class="absolute w-full h-full"
    />
    <canvas
      ref="canvasSiliconHot"
      class="absolute w-full h-full"
    />
    <canvas
      ref="canvasMetalTiles"
      class="absolute w-full h-full"
    />
    <canvas
      ref="canvasMetalHot"
      class="absolute w-full h-full"
    />
    <canvas
      ref="canvasOverlay"
      class="absolute w-full h-full"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      oncontextmenu="return false;"
    >
      Your browser must support the canvas tag.
    </canvas>
    <div class="absolute w-full h-full pointer-events-none select-none">
      <div class="flex flex-col justify-end w-full h-full">
        <div class="font-georgia12 text-[12px] text-black m-1" v-html="debugMsg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layer, MetalValue, SiliconValue, ConnectionValue, ViaValue, GateValue } from '@/serialization';
import { GateNode, PathNode, Point } from '@/simulation';
import { ToolboxMode } from '@/composables/use-toolbox';
import useImageLoader from '@/composables/use-image-loader';

const canvasBackground = ref<HTMLCanvasElement>();
const canvasSiliconTiles = ref<HTMLCanvasElement>();
const canvasSiliconHot = ref<HTMLCanvasElement>();
const canvasMetalTiles = ref<HTMLCanvasElement>();
const canvasMetalHot = ref<HTMLCanvasElement>();
const canvasOverlay = ref<HTMLCanvasElement>();
const { field, updateDesignScore } = useFieldGraph();
const { network, sim, isRunning, isPaused, onRender: onCircuitRender, load } = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();
const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
  isOutside: canvasMouseOutside,
} = useMouseInElement(canvasOverlay);
const images = useImageLoader();
const TILE_SIZE = 13;
const isDrawing = ref(false);
let prevDrawingCoords: Point = [0, 0];
const debugMsg = ref('');

const updateDesignScoreThrottle = useThrottleFn(updateDesignScore, 1000, true);

const renderBackground = () => {
  const ctx = canvasBackground.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get background canvas context');
  if (!field.value) throw new Error('Could not get field');
  const dims = field.value?.getDimensions();
  // Background colour
  ctx.fillStyle = '#959595';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw grid lines
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#818181';
  for (let x = 0; x < dims.columns; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, dims.rows * TILE_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y < dims.rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(dims.columns * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }
  // Draw border
  ctx.strokeStyle = '#000';
  ctx.strokeRect(0, 0, dims.columns * TILE_SIZE, dims.rows * TILE_SIZE);
  ctx.restore();
}

const renderTiles = (options?: { metal?: boolean, silicon?: boolean }, bounds?: number[]) => {
  if (!field.value) throw new Error('Could not get field');
  const contextSiliconTiles = canvasSiliconTiles.value?.getContext('2d');
  const contextMetalTiles = canvasMetalTiles.value?.getContext('2d');
  if (!contextSiliconTiles) throw new Error('Could not get background canvas context');
  if (!contextMetalTiles) throw new Error('Could not get background canvas context');
  const data = field.value.getData();
  const dims = data.getDimensions();
  const {
    metal: showMetal,
    silicon: showSilicon,
  } = Object.assign({ metal: true, silicon: true }, options);
  let [ left, top, right, bottom ] = bounds ?? [ 0, 0, dims.columns, dims.rows ];
  left = Math.max(0, left-1);
  top = Math.max(0, top-1);
  right = Math.min(dims.columns, right+2);
  bottom = Math.min(dims.rows, bottom+2);
  contextSiliconTiles.clearRect(left*TILE_SIZE+1, top*TILE_SIZE+1, (right-left)*TILE_SIZE, (bottom - top)*TILE_SIZE);
  contextMetalTiles.clearRect(left*TILE_SIZE+1, top*TILE_SIZE+1, (right-left)*TILE_SIZE, (bottom - top)*TILE_SIZE);
  if (showSilicon) {
    const ctx = contextSiliconTiles;
    const { renderTile, getDirectionX, getDirectionY } = useTileRenderer(ctx);
    const siliconLayer = data.getLayer(Layer.Silicon);
    const siliconConnHLayer = data.getLayer(Layer.SiliconConnectionsH);
    const siliconConnVLayer = data.getLayer(Layer.SiliconConnectionsV);
    const gatesHLayer = data.getLayer(Layer.GatesH);
    const gatesVLayer = data.getLayer(Layer.GatesV);
    const viaLayer = data.getLayer(Layer.Vias);
    const tileSizeHalf = Math.floor(TILE_SIZE / 2);
    const viaImage = images.findImage('/tiles/link.png');
    ctx.save();
    ctx.translate(left*TILE_SIZE+1, top*TILE_SIZE+1);
    ctx.strokeStyle = '#060000';
    // Silicon layer + vias
    for (let x = left; x < right; x++) {
      ctx.save();
      for (let y = top; y < bottom; y++) {
        const st = siliconLayer[x][y];
        if (st === SiliconValue.PSilicon) {
          const xdir = getDirectionX(siliconConnHLayer, x, y);
          const ydir = getDirectionY(siliconConnVLayer, x, y);
          if (gatesHLayer[x][y] === GateValue.Gate) {
            renderTile(TileType.PGateH, xdir, ydir);
          } else if (gatesVLayer[x][y] === GateValue.Gate) {
            renderTile(TileType.PGateV, xdir, ydir);
          } else {
            renderTile(TileType.PSilicon, xdir, ydir);
          }
        } else if (st === SiliconValue.NSilicon) {
          const xdir = getDirectionX(siliconConnHLayer, x, y);
          const ydir = getDirectionY(siliconConnVLayer, x, y);
          if (gatesHLayer[x][y] === GateValue.Gate) {
            renderTile(TileType.NGateH, xdir, ydir);
          } else if (gatesVLayer[x][y] === GateValue.Gate) {
            renderTile(TileType.NGateV, xdir, ydir);
          } else {
            renderTile(TileType.NSilicon, xdir, ydir);
          }
        }
        if (viaLayer[x][y] === ViaValue.Via) {
          //ctx.beginPath();
          //ctx.roundRect(tileSizeHalf-2.5, tileSizeHalf-2.5, 5, 5, 1.5);
          //ctx.stroke();
          //ctx.closePath();
          ctx.drawImage(viaImage, 0, 0);
        }
        ctx.translate(0, TILE_SIZE);
      }
      ctx.restore();
      ctx.translate(TILE_SIZE, 0);
    }
    ctx.restore();
  }
  // Metal layer
  if (showMetal) {
    const ctx = contextMetalTiles;
    if (!ctx) throw new Error('Could not get background canvas context');
    const { renderTile, getDirectionX, getDirectionY } = useTileRenderer(ctx);
    const metalLayer = data.getLayer(Layer.Metal);
    const metalConnHLayer = data.getLayer(Layer.MetalConnectionsH);
    const metalConnVLayer = data.getLayer(Layer.MetalConnectionsV);
    ctx.save();
    ctx.translate(left*TILE_SIZE+1, top*TILE_SIZE+1);
    for (let x = left; x < right; x++) {
      ctx.save();
      for (let y = top; y < bottom; y++) {
        if (metalLayer[x][y] === MetalValue.Metal) {
          const xdir = getDirectionX(metalConnHLayer, x, y);
          const ydir = getDirectionY(metalConnVLayer, x, y);
          renderTile(TileType.Metal, xdir, ydir);
        }
        ctx.translate(0, TILE_SIZE);
      }
      ctx.restore();
      ctx.translate(TILE_SIZE, 0);
    }
    ctx.restore();
  }
}

const renderHot = (options?: { metal?: boolean, silicon?: boolean }) => {
  if (!field.value) throw new Error('Could not get field');
  const ctxMetalHot = canvasMetalHot.value?.getContext('2d');
  const ctxSiliconHot = canvasSiliconHot.value?.getContext('2d');
  if (!ctxMetalHot) throw new Error('Could not get metal-hot canvas context');
  if (!ctxSiliconHot) throw new Error('Could not get silicon-hot canvas context');
  const {
    metal: showMetal,
    silicon: showSilicon,
  } = Object.assign({ metal: true, silicon: true }, options);
  const dims = field.value.getDimensions();
  ctxMetalHot.clearRect(0, 0, ctxMetalHot.canvas.width, ctxMetalHot.canvas.height);
  ctxSiliconHot.clearRect(0, 0, ctxSiliconHot.canvas.width, ctxSiliconHot.canvas.height);
  ctxMetalHot.save();
  ctxSiliconHot.save();
  ctxMetalHot.translate(1, 1);
  ctxSiliconHot.translate(1, 1);
  // Draw current
  if (isRunning.value && network.value) {
    const hotImage = images.findImage('/tiles/hot.png');
    for (let x = 0; x < dims.columns; x++) {
      for (let y = 0; y < dims.rows; y++) {
        if (showSilicon) {
          const nodes = network.value.getNodesAt([x, y], 'silicon');
          const hot = nodes.some(n => {
            if (n instanceof PathNode) {
              return n.state;
            } else if (n instanceof GateNode) {
              const open = n.isNPN ? n.active : !n.active;
              return open && n.gatedPaths.some(p => p.state);
            }
            return false;
          });
          if (hot) {
            ctxSiliconHot.drawImage(hotImage, x*TILE_SIZE, y*TILE_SIZE);
          }
        }
        if (showMetal) {
          const nodes = network.value.getNodesAt([x, y], 'metal');
          const hot = nodes.some(n => {
            if (n instanceof PathNode) {
              return n.state;
            }
            return false;
          });
          if (hot) {
            ctxMetalHot.drawImage(hotImage, x*TILE_SIZE, y*TILE_SIZE);
          }
        }
      }
    }
  }
  ctxMetalHot.restore();
  ctxSiliconHot.restore();
}

const renderOverlay = () => {
  const ctx = canvasOverlay.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get overlay canvas context');
  if (!network.value) throw new Error('Could not get network');
  if (!field.value) throw new Error('Could not get field');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  /*
  // Draw mouse cursor
  ctx.save();
  ctx.translate(0.5, 0.5);
  if (!canvasMouseOutside.value) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, calc(2/3))';
    ctx.strokeRect(Math.floor(canvasMouseX.value / TILE_SIZE) * TILE_SIZE, Math.floor(canvasMouseY.value / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  ctx.restore();
  */
  // Draw pin labels
  ctx.fillStyle = '#000';
  ctx.font = '10px Georgia10';
  const pinNodes = network.value.getPinNodes()
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [ x, y ] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    ctx.fillText(label, x*TILE_SIZE+2, y*TILE_SIZE+10);
  }
}

const renderAll = () => {
  renderBackground();
  renderTiles();
  renderHot();
  renderOverlay();
}

const draw = (mode: ToolboxMode, coordA: Point, coordB: Point) => {
  if (!field.value) return;
  switch (mode) {
    default:
    case 'none':
      return;
    case 'draw-metal':
      field.value.draw('metal', coordA, coordB);
      break;
    case 'draw-p-silicon':
      field.value.draw('p-silicon', coordA, coordB);
      break;
    case 'draw-n-silicon':
      field.value.draw('n-silicon', coordA, coordB);
      break;
    case 'draw-via':
      field.value.draw('via', coordA, coordB);
      break;
    case 'erase':
      field.value.erase([ 'metal', 'silicon', 'via' ], coordA, coordB);
      break;
    case 'erase-metal':
      field.value.erase('metal', coordA, coordB);
      break;
    case 'erase-silicon':
      field.value.erase('silicon', coordA, coordB);
      break;
    case 'erase-via':
      field.value.erase('via', coordA, coordB);
      break;
    case 'erase-gate':
      field.value.erase('gate', coordA, coordB);
      break;
    case 'select':
      console.warn('select: not yet implemented');
      return;
  }
  updateDesignScoreThrottle();
  const start = [ Math.min(coordA[0], coordB[0]), Math.min(coordA[1], coordB[1]) ];
  const end = [ Math.max(coordA[0], coordB[0]), Math.max(coordA[1], coordB[1]) ];
  renderTiles(undefined, [ start[0], start[1], end[0], end[1] ]);
}

const mouseToGrid = (mx: number, my: number): Point => {
  if (!canvasOverlay.value) return [0, 0];
  const rect = canvasOverlay.value.getBoundingClientRect();
  const x = Math.trunc((mx - rect.left) / TILE_SIZE);
  const y = Math.trunc((my - rect.top) / TILE_SIZE);
  return [x, y];
}

const onMouseMove = (e: MouseEvent) => {
  if (!canvasOverlay.value) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    if (isDrawing.value && field.value) {
      const coords = mouseToGrid(e.clientX, e.clientY);
      draw(toolBoxMode.value, prevDrawingCoords, coords);
      prevDrawingCoords = coords;
    }
  }
}

const onMouseDown = (e: MouseEvent) => {
  if (!canvasOverlay.value) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = true;
    prevDrawingCoords = mouseToGrid(e.clientX, e.clientY);
    draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (!canvasOverlay.value) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = false;
  }
}

watch([ canvasMouseX, canvasMouseY, canvasMouseOutside ], ([x, y, outside]) => {
  const dbg: string[] = [];
const col = Math.trunc(canvasMouseX.value/TILE_SIZE);
const row = Math.trunc(canvasMouseY.value/TILE_SIZE);
  dbg.push(`Mouse: ${x}, ${y} (${outside ? 'outside' : 'inside'})`);
  dbg.push(`Coord: ${col}, ${row}`);
  const data = field.value?.getData();
  if (data) {
    data.getLayers().forEach((layer, idx) => {
      dbg.push(`Layer ${idx}: ${layer[col]?.[row]}`);
    });
  }
  debugMsg.value = dbg.join('<br/>');
});

useResizeObserver(canvasBackground, (entries, obs) => {
  const ctx = canvasBackground.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderBackground();
});

useResizeObserver(canvasSiliconTiles, (entries, obs) => {
  const ctx = canvasSiliconTiles.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderTiles({ silicon: true });
});

useResizeObserver(canvasSiliconHot, (entries, obs) => {
  const ctx = canvasSiliconHot.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderHot({ silicon: true });
});

useResizeObserver(canvasMetalTiles, (entries, obs) => {
  const ctx = canvasMetalTiles.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderTiles({ metal: true });
});

useResizeObserver(canvasMetalHot, (entries, obs) => {
  const ctx = canvasMetalHot.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderHot({ metal: true });
});

useResizeObserver(canvasOverlay, (entries, obs) => {
  const ctx = canvasOverlay.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderOverlay();
});

onMounted(() => {

  onCircuitRender(renderHot);

  watch(isRunning, (isRunning) => renderHot());

  watch(sim, (sim) => {
    if (!sim) return;
    renderAll();
  });

  watch(canvasBackground, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderBackground()
  });

  watch(canvasSiliconTiles, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderTiles();
  });

  watch(canvasSiliconHot, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderHot();
  });

  watch(canvasMetalTiles, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderTiles();
  });

  watch(canvasMetalHot, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderHot();
  });

  watch(canvasOverlay, (canvas) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    renderOverlay();
  });

  renderAll();

});

</script>
