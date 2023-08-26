<template>
  <div class="relative w-full h-full">
    <canvas
      ref="canvasBackground"
      class="absolute w-full h-full"
    >
    </canvas>
    <canvas
      ref="canvasTiles"
      class="absolute w-full h-full"
    >
    </canvas>
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
  </div>
</template>

<script setup lang="ts">
import { Layer, MetalValue, SiliconValue, ConnectionValue, ViaValue, GateValue } from '@/serialization';
import { GateNode, PathNode, Point } from '@/simulation';
import { ToolboxMode } from '@/composables/use-toolbox';

const canvasBackground = ref<HTMLCanvasElement>();
const canvasTiles = ref<HTMLCanvasElement>();
const canvasOverlay = ref<HTMLCanvasElement>();
const { field, updateDesignScore } = useFieldGraph();
const { network, sim, isRunning, isPaused, onPostStep, load } = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();
const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
  isOutside: canvasMouseOutside,
} = useMouseInElement(canvasOverlay);
const TILE_SIZE = 13;
const isDrawing = ref(false);
let prevDrawingCoords: Point = [0, 0];

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

const renderTiles = () => {
  const ctx = canvasTiles.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get background canvas context');
  if (!field.value) throw new Error('Could not get field');
  const data = field.value.getData();
  const dims = data.getDimensions();
  const siliconLayer = data.getLayer(Layer.Silicon);
  const siliconConnHLayer = data.getLayer(Layer.SiliconConnectionsH);
  const siliconConnVLayer = data.getLayer(Layer.SiliconConnectionsV);
  const gatesHLayer = data.getLayer(Layer.GatesH);
  const gatesVLayer = data.getLayer(Layer.GatesV);
  const metalLayer = data.getLayer(Layer.Metal);
  const metalConnHLayer = data.getLayer(Layer.MetalConnectionsH);
  const metalConnVLayer = data.getLayer(Layer.MetalConnectionsV);
  const viaLayer = data.getLayer(Layer.Vias);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(1, 1);
  // Silicon layer
  for (let x = 0; x < dims.columns; x++) {
    for (let y = 0; y < dims.rows; y++) {
      const st = siliconLayer[x][y];
      if (st === SiliconValue.PSilicon) {
        ctx.fillStyle = '#F7FE02';
        const w = siliconConnHLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        const h = siliconConnVLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, w, h);
        if (gatesHLayer[x][y] === GateValue.Gate) {
          ctx.fillStyle = '#860000';
          ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE+2, TILE_SIZE, TILE_SIZE-4);
        } else if (gatesVLayer[x][y] === GateValue.Gate) {
          ctx.fillStyle = '#860000';
          ctx.fillRect(x*TILE_SIZE+2, y*TILE_SIZE, TILE_SIZE-4, TILE_SIZE);
        }
      } else if (st === SiliconValue.NSilicon) {
        ctx.fillStyle = '#B50000';
        const w = siliconConnHLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        const h = siliconConnVLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, w, h);
        if (gatesHLayer[x][y] === GateValue.Gate) {
          ctx.fillStyle = '#EDC900';
          ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE+2, TILE_SIZE, TILE_SIZE-4);
        } else if (gatesVLayer[x][y] === GateValue.Gate) {
          ctx.fillStyle = '#EDC900';
          ctx.fillRect(x*TILE_SIZE+2, y*TILE_SIZE, TILE_SIZE-4, TILE_SIZE);
        }
      }
    }
  }
  // Metal layer
  const tileSizeHalf = Math.floor(TILE_SIZE / 2);
  for (let x = 0; x < dims.columns; x++) {
    for (let y = 0; y < dims.rows; y++) {
      if (viaLayer[x][y] === ViaValue.Via) {
        ctx.fillStyle = '#060000';
        ctx.beginPath();
        ctx.arc(x*TILE_SIZE+tileSizeHalf, y*TILE_SIZE+tileSizeHalf, 2.5, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      }
      if (metalLayer[x][y] === MetalValue.Metal) {
        ctx.fillStyle = 'rgba(251, 251, 251, 0.51)';
        const w = metalConnHLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        const h = metalConnVLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, w, h);
      }
    }
  }
  ctx.restore();
}

const renderOverlay = () => {
  const ctx = canvasOverlay.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get background canvas context');
  if (!network.value) throw new Error('Could not get network');
  if (!field.value) throw new Error('Could not get field');
  const dims = field.value?.getDimensions();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(1, 1);
  // Draw current
  if (isRunning.value && network.value) {
    for (let x = 0; x < dims.columns; x++) {
      for (let y = 0; y < dims.rows; y++) {
        const nodes = network.value.getNodesAt([x, y]);
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
          ctx.fillStyle = 'rgba(0, 0, 0, 0.49)';
          ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
  /*
  // Draw mouse cursor
  ctx.save();
  ctx.translate(0.5, 0.5);
  if (!canvasMouseOutside.value) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, calc(2/3))';
    ctx.strokeRect(Math.floor(canvasMouseX.value / TILE_SIZE) * TILE_SIZE, Math.floor(canvasMouseY.value / TILE_SIZE) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  */
  ctx.restore();
  // Draw pin labels
  const pinNodes = network.value.getPinNodes()
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [ x, y ] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    ctx.fillStyle = '#000';
    ctx.font = '10px Georgia10';
    ctx.fillText(label, x*TILE_SIZE+2, y*TILE_SIZE+10);
  }
}

const renderAll = () => {
  renderBackground();
  renderTiles();
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
  renderTiles();
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

onPostStep(renderOverlay);

watch(sim, (sim) => {
  if (!sim) return;
  renderAll();
});

watch(isRunning, (isRunning) => renderOverlay());

watch(canvasBackground, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  renderBackground()
});

watch(canvasTiles, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  renderTiles();
});

watch(canvasOverlay, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  renderOverlay();
});

useResizeObserver(canvasBackground, (entries, obs) => {
  const ctx = canvasBackground.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderBackground();
});

useResizeObserver(canvasTiles, (entries, obs) => {
  const ctx = canvasTiles.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderTiles();
});

useResizeObserver(canvasOverlay, (entries, obs) => {
  const ctx = canvasOverlay.value?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.width = Math.trunc(ctx.canvas.clientWidth);
  ctx.canvas.height = Math.trunc(ctx.canvas.clientHeight);
  renderOverlay();
});

onMounted(renderAll);

</script>
