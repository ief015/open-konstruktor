<template>
  <canvas
    ref="canvas"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
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

const { field, load: loadField } = useFieldGraph();
const { network, isRunning, isPaused, onRender } = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();

//loadField('eNrtml124yAMhZMrv3QNs4V5n7XM/jcyjW1Af1w7dt1OWpLjE7fX6EMQhIBMv6dfb3/vb3/u0+3IexS8d9+0INy7FEIj2gciD/Nl1FJwxs8Pe2Yx4OrAiMzHtWCrki7IfERrHISqMh9rwYz4hI/tkZ0+Qtm8PeNjTtzho/s67fexVRI7v6uuVS1xZz+ysUH6sT8+Nn18bjzi6HgcPg4fh48HfRzJw2cXnNM59F+zKiLpdVaV5YX5qflTcwVSX9PtIU+3VZWqq2feHyp/KePlP/WmFX7cLuaq/n4/t6aIL17IqdzsL3Iz7tBVTsruZKMYz9noup3IgV2M99mwbW7ZtTlztpETttUD2xVP2eBsX7m+nLLB2YveZ4OzwdmhYROZsMHZpe6R/YgTSdMm5RndjTIJKhb4zKpyiVO1Zdr3vj6BZai14T3fXxq4WMDcFVG/nSqjzkMd6lCfUV8nVIq6iTNXmYFUwqxyS20g44rjisU5rrIcuXY2DlxtOXCFc6m/4P5S7kY7n/GXt/OJ/h3cF+OOUPlJqpiB7lcIWJP/ZYG85mBl1VGSeBZIxeRvUssmXGM5cFVgSbnOsri8kXBVnTN/hfkbLEtvasi43F8zTry/vgflo/p3cP9rroxQ+XWhks6GZlNkDR1m+Kt+XEKHzbKaDcqVLEOrXEnCTuPyL4+EOgeubHDd3pLjcn8Zt9vOu7jM3612HtyX5Y6s8gtVfeKAuO9c5kMdKsuCoRwwdff91AFUyd/q7Bu4xnLg+t10yzWWA1c4l/oL7i/lbrTzGX95O5/o38F9Me4PCZWnzptgL205X/c1VVSu4xcO+qS7DubOOTja0pSo1bJoy+LVcAje4QrjrotaSZfYAonctgCXhFsz0nKcaLjq+DvntlZMuFoMXL1yS7h1kKVcbHNBueBcUC4oF5wLygXlgnNBuaBccC4oF5QLzrXjSHarejUjIROWeF14xv0hoTK/zqq1awD3k6K2S+Z/bOR22LSsLXtZ+rNh24NpqiQ/cwpqws1WM5KUhURurXNcKtsB3uGKnnFSrvpw/nrTwV/CdWcFsZ0Pc3GOi+u4uI6L67i4joujXD3MermujrLXRiRS53811dAC');

const isDrawing = ref(false);
let prevDrawingCoords: Point = [0, 0];

const renderField = () => {
  if (!ctx)
    return;
  ctx.fillStyle = '#666';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!field.value)
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

  ctx.strokeStyle = '#000';
  ctx.strokeRect(0.5, 0.5, dims.columns * TILE_SIZE, dims.rows * TILE_SIZE);

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
  
  const tileSizeHalf = TILE_SIZE / 2;
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
      console.warn('erase-gate: not yet implemented');
      return;
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
  if (isDrawing.value && field.value) {
    const coords = mouseToGrid(e.clientX, e.clientY);
    draw(toolBoxMode.value, prevDrawingCoords, coords);
    prevDrawingCoords = coords;
  }
}

const onMouseDown = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  isDrawing.value = true;
  prevDrawingCoords = mouseToGrid(e.clientX, e.clientY);
  draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
}

const onMouseUp = (e: MouseEvent) => {
  if (!ctx) return;
  if (isRunning.value) return;
  isDrawing.value = false;
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

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null;
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;
  ctx.imageSmoothingEnabled = false;
  addEventListener('resize', onResize);
  renderField();
});

onUnmounted(() => {
  removeEventListener('resize', onResize);
});

</script>
