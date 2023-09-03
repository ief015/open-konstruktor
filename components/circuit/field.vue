<template>
  <div class="relative w-full h-full">
    <canvas
      ref="canvas"
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

const TILE_SIZE = 13;
const TILE_SIZE_HALF = Math.floor(TILE_SIZE / 2);

const canvas = ref<HTMLCanvasElement>();
const canvasDirty = ref(false);
const canvasLayers = {
  'background':    document.createElement('canvas'),
  'silicon-tiles': document.createElement('canvas'),
  'silicon-hot':   document.createElement('canvas'),
  'metal-tiles':   document.createElement('canvas'),
  'metal-hot':     document.createElement('canvas'),
  'overlay':       document.createElement('canvas'),
};
const { field, updateDesignScore } = useFieldGraph();
const {
  network, sim, isRunning, isPaused,
  onRender: onCircuitRender, load,
} = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();
const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
  isOutside: canvasMouseOutside,
} = useMouseInElement(canvas);
const images = useImageLoader();
const isDrawing = ref(false);
let prevDrawingCoords: Point = [0, 0];
const debugMsg = ref('');

const updateDesignScoreThrottle = useThrottleFn(updateDesignScore, 1000, true);

const renderBackground = () => {
  const ctx = canvasLayers['background']?.getContext('2d');
  if (!ctx) throw new Error('Could not get background canvas context');
  if (!field.value) throw new Error('Could not get field');
  canvasDirty.value = true;
  const { columns, rows } = field.value.getDimensions();
  const [ minCol, maxCol ] = field.value.getMinMaxColumns();
  // Background colour
  ctx.fillStyle = '#959595';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw grid lines
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#818181';
  for (let x = 0; x < columns; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, rows * TILE_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y < rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(columns * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }
  ctx.restore();
  // Draw pin column boundaries
  ctx.fillStyle = `rgba(0,0,0,${20/255})`;
  ctx.fillRect(0, 0, minCol*TILE_SIZE+1, rows*TILE_SIZE+1);
  ctx.fillRect((maxCol+1)*TILE_SIZE, 0, (columns-maxCol-1)*TILE_SIZE, rows*TILE_SIZE);
  // Draw border
  ctx.strokeStyle = '#000';
  ctx.strokeRect(0.5, 0.5, columns * TILE_SIZE, rows * TILE_SIZE);
}

const renderTiles = (
  options: { metal?: boolean, silicon?: boolean } = { metal: true, silicon: true },
  bounds?: number[]
) => {
  if (!field.value) throw new Error('Could not get field');
  const contextSiliconTiles = canvasLayers['silicon-tiles']?.getContext('2d');
  const contextMetalTiles = canvasLayers['metal-tiles']?.getContext('2d');
  if (!contextSiliconTiles) throw new Error('Could not get background canvas context');
  if (!contextMetalTiles) throw new Error('Could not get background canvas context');
  canvasDirty.value = true;
  const data = field.value.getData();
  const { columns, rows } = data.getDimensions();
  const {
    metal: showMetal,
    silicon: showSilicon,
  } = Object.assign({ metal: false, silicon: false }, options);
  let [ left, top, right, bottom ] = bounds ?? [ 0, 0, columns, rows ];
  left = Math.max(0, left-1);
  top = Math.max(0, top-1);
  right = Math.min(columns, right+2);
  bottom = Math.min(rows, bottom+2);
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
          //ctx.roundRect(TILE_SIZE_HALF - 2.5, TILE_SIZE_HALF - 2.5, 5, 5, 1.5);
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

const renderHot = (
  options: { metal?: boolean, silicon?: boolean } = { metal: true, silicon: true }
) => {
  if (!field.value) throw new Error('Could not get field');
  const ctxMetalHot = canvasLayers['metal-hot']?.getContext('2d');
  const ctxSiliconHot = canvasLayers['silicon-hot']?.getContext('2d');
  if (!ctxMetalHot) throw new Error('Could not get metal-hot canvas context');
  if (!ctxSiliconHot) throw new Error('Could not get silicon-hot canvas context');
  canvasDirty.value = true;
  const {
    metal: showMetal,
    silicon: showSilicon,
  } = Object.assign({ metal: false, silicon: false }, options);
  const { columns, rows } = field.value.getDimensions();
  ctxMetalHot.clearRect(0, 0, ctxMetalHot.canvas.width, ctxMetalHot.canvas.height);
  ctxSiliconHot.clearRect(0, 0, ctxSiliconHot.canvas.width, ctxSiliconHot.canvas.height);
  ctxMetalHot.save();
  ctxSiliconHot.save();
  ctxMetalHot.translate(1, 1);
  ctxSiliconHot.translate(1, 1);
  // Draw current
  if (isRunning.value && network.value) {
    const hotImage = images.findImage('/tiles/hot.png');
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
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
  const ctx = canvasLayers['overlay'].getContext('2d');
  if (!ctx) throw new Error('Could not get overlay canvas context');
  if (!network.value) throw new Error('Could not get network');
  if (!field.value) throw new Error('Could not get field');
  canvasDirty.value = true;
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
  const textPadX = 3;
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [ x, y ] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    ctx.fillText(label, x*TILE_SIZE+textPadX, y*TILE_SIZE+10, (TILE_SIZE*3)-(textPadX*2));
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
  const bounds = [
    Math.min(coordA[0], coordB[0]), Math.min(coordA[1], coordB[1]),
    Math.max(coordA[0], coordB[0]), Math.max(coordA[1], coordB[1]),
  ];
  renderTiles(undefined, bounds);
}

const mouseToGrid = (mx: number, my: number): Point => {
  if (!canvas.value) return [0, 0];
  const rect = canvas.value.getBoundingClientRect();
  const x = Math.trunc((mx - rect.left) / TILE_SIZE);
  const y = Math.trunc((my - rect.top) / TILE_SIZE);
  return [x, y];
}

const onMouseMove = (e: MouseEvent) => {
  if (!canvas.value) return;
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
  if (!canvas.value) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = true;
    prevDrawingCoords = mouseToGrid(e.clientX, e.clientY);
    draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (!canvas.value) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = false;
  }
}

const onResize = () => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) return;
  const { clientWidth, clientHeight } = ctx.canvas;
  ctx.canvas.width = Math.trunc(clientWidth);
  ctx.canvas.height = Math.trunc(clientHeight);
  for (const canvas of Object.values(canvasLayers)) {
    if (!canvas) continue;
    canvas.width = Math.trunc(clientWidth);
    canvas.height = Math.trunc(clientHeight);
  }
  renderAll();
}

useRafFn(({ delta, timestamp }) => {
  if (!canvasDirty.value) return;
  canvasDirty.value = false;
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get background canvas context');
  ctx.drawImage(canvasLayers['background'], 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(canvasLayers['silicon-tiles'], 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(canvasLayers['silicon-hot'], 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(canvasLayers['metal-tiles'], 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(canvasLayers['metal-hot'], 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(canvasLayers['overlay'], 0, 0, ctx.canvas.width, ctx.canvas.height);
});

onCircuitRender(() => {
  renderHot();
});

watch(isRunning, (isRunning) => {
  renderHot();
});

watch(sim, (sim) => {
  sim && renderAll();
});

watch([ canvasMouseX, canvasMouseY, canvasMouseOutside ], ([x, y, outside]) => {
  const dbg: string[] = [];
  if (!outside) {
    const col = Math.trunc(canvasMouseX.value/TILE_SIZE);
    const row = Math.trunc(canvasMouseY.value/TILE_SIZE);
    dbg.push(`Mouse: ${x}, ${y}`);
    dbg.push(`Coord: ${col}, ${row}`);
    /*
    const data = field.value?.getData();
    if (data) {
      data.getLayers().forEach((layer, idx) => {
        dbg.push(`Layer ${idx}: ${layer[col]?.[row]}`);
      });
    }
    */
  }
  debugMsg.value = dbg.join('<br/>');
});

useResizeObserver(canvas, (entries, obs) => {
  onResize();
});

watch(canvas, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  renderAll();
});

onMounted(() => {
  onResize();
});

</script>
