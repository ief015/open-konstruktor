<template>
  <canvas
    ref="canvas"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    oncontextmenu="return false;"
  >
    Your browser must support the canvas tag.
  </canvas>
</template>

<script setup lang="ts">
import { Layer, MetalValue, SiliconValue, ConnectionValue, ViaValue, GateValue } from '@/serialization';
import { GateNode, PathNode, Point } from '@/simulation';
import { ToolboxMode } from '@/composables/use-toolbox';

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
const TILE_SIZE = 12;

const { field } = useFieldGraph();
const { network, sim, isRunning, isPaused, onRender, load } = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();

const isDrawing = ref(false);
let prevDrawingCoords: Point = [0, 0];

const renderField = () => {
  if (!ctx)
    return;
  ctx.resetTransform();
  ctx.fillStyle = '#959595';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!field.value || !network.value)
    return;

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

  ctx.save();
  ctx.translate(0.5, 0.5);

  // draw grid lines
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

  // outline
  ctx.strokeStyle = '#000';
  ctx.strokeRect(0, 0, dims.columns * TILE_SIZE, dims.rows * TILE_SIZE);

  ctx.restore();

  // silicon layer
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

  // metal layer
  const tileSizeHalf = Math.floor(TILE_SIZE / 2);
  for (let x = 0; x < dims.columns; x++) {
    for (let y = 0; y < dims.rows; y++) {
      if (metalLayer[x][y] === MetalValue.Metal) {
        ctx.fillStyle = 'rgba(251, 251, 251, 0.51)';
        const w = metalConnHLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        const h = metalConnVLayer[x][y] == ConnectionValue.Connected ? TILE_SIZE : TILE_SIZE-1;
        ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, w, h);
      }
      if (viaLayer[x][y] === ViaValue.Via) {
        ctx.fillStyle = '#060000';
        ctx.beginPath();
        ctx.arc(x*TILE_SIZE+tileSizeHalf, y*TILE_SIZE+tileSizeHalf, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  // current
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

  const pinNodes = network.value.getPinNodes()
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [ x, y ] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    ctx.fillStyle = '#000';
    ctx.font = '10px Georgia10';
    ctx.fillText(label, x*TILE_SIZE+2, y*TILE_SIZE+10);
  }
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
  renderField();
}

const mouseToGrid = (mx: number, my: number): Point => {
  if (!ctx) return [0, 0];
  const rect = ctx.canvas.getBoundingClientRect();
  const x = Math.trunc((mx - rect.left) / 12);
  const y = Math.trunc((my - rect.top) / 12);
  return [x, y];
}

const onMouseMove = (e: MouseEvent) => {
  if (!ctx) return;
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
  if (!ctx) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = true;
    prevDrawingCoords = mouseToGrid(e.clientX, e.clientY);
    draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
  }
}

const onMouseUp = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  if (e.button === 0) {
    isDrawing.value = false;
  }
}

const onResize = () => {
  if (!ctx)
    return;
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  renderField();
}

onRender(renderField);

watch(isRunning, (running) => {
  if (running) {
    isDrawing.value = false;
  }
  renderField();
});

watch(sim, (sim) => {
  if (!sim) return;
  renderField();
});

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null;
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  ctx.imageSmoothingEnabled = false;
  window.addEventListener('resize', onResize);
  renderField();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

</script>
