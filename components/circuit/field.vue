<template>
  <div class="relative w-full h-full">
    <canvas
      ref="canvas"
      class="absolute w-full h-full"
      @mousedown="onMouseDown"
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
import { FieldGraph, GateNode, PathNode, Point } from '@/simulation';
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
const { field, dimensions, updateDesignScore } = useFieldGraph();
const updateDesignScoreThrottle = useThrottleFn(updateDesignScore, 1000, true);
const {
  sim, network, circuitFactory, isRunning, stepsPerSecond,
  onRender: onCircuitRender,
} = useCircuitSimulator();
const { mode: toolBoxMode } = useToolbox();
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const fieldWidth = computed(() => dimensions.columns * TILE_SIZE);
const fieldHeight = computed(() => dimensions.rows * TILE_SIZE);
const viewX = ref(0);
const viewY = ref(0);
const viewBounds = computed(() => {
  return {
    minX: Math.min(fieldWidth.value - canvasWidth.value + 1, Math.trunc(fieldWidth.value / 2), 0),
    minY: Math.min(fieldHeight.value - canvasHeight.value + 1, Math.trunc(fieldHeight.value / 2), 0),
    maxX: Math.max(fieldWidth.value - canvasWidth.value + 1, 0),
    maxY: Math.max(fieldHeight.value - canvasHeight.value + 1, 0),
  };
});
const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
  isOutside: canvasMouseOutside,
} = useMouseInElement(canvas);
const coordMouseX = computed(() => Math.floor((canvasMouseX.value + viewX.value) / TILE_SIZE));
const coordMouseY = computed(() => Math.floor((canvasMouseY.value + viewY.value) / TILE_SIZE));
const images = useImageLoader();
const isDrawing = ref(false);
const isPanning = ref(false);
let prevDrawingCoords: Point = [0, 0];
const perfRenderTime = ref(0);
const debugMsg = computed(() => {
  const dbg: string[] = [];
  if (!canvasMouseOutside.value) {
    const mouseX = canvasMouseX.value.toFixed(0);
    const mouseY = canvasMouseY.value.toFixed(0);
    const coordX = coordMouseX.value;
    const coordY = coordMouseY.value;
    //dbg.push(`Mouse: [${mouseX}, ${mouseY}]`);
    dbg.push(`Coord: [${coordX}, ${coordY}]`);
    /*
    const data = field.value?.getData();
    if (data) {
      data.getLayers().forEach((layer, idx) => {
        dbg.push(`Layer ${idx}: ${layer[col]?.[row]}`);
      });
    }
    */
  }
  const panX = viewX.value.toFixed(0);
  const panY = viewY.value.toFixed(0);
  const { minX, minY, maxX, maxY } = viewBounds.value;
  const { columns, rows } = dimensions;
  // dbg.push(`Grid: [${columns}, ${rows}]`);
  //dbg.push(`View: [${panX}, ${panY}]`);
  // dbg.push(`View Bounds: min=[${minX}, ${minY}] max=[${maxX}, ${maxY}]`);
  dbg.push(`Select start: ${selectionStart.value}`);
  dbg.push(`Select end: ${selectionEnd.value}`);
  dbg.push(`Last render ms: ${perfRenderTime.value.toFixed(2)}`);
  dbg.push(`Steps/s: ${stepsPerSecond.value.toFixed(2)}`);
  return dbg.join('<br/>');
});
const queueAnimFuncs: Set<() => void> = new Set();
const selectionStart = ref<Point>();
const selectionEnd = ref<Point>();
const selectionBounds = computed<[
  left: number,
  top: number,
  right: number,
  bottom: number
]|undefined>(() => {
  if (!selectionStart.value || !selectionEnd.value)
    return undefined;
  const [ sx, sy ] = selectionStart.value;
  const [ ex, ey ] = selectionEnd.value;
  return [
    Math.min(sx, ex),
    Math.min(sy, ey),
    Math.max(sx, ex),
    Math.max(sy, ey),
  ];
})
const selectionTranslate = ref<Point>();
const selectionData = shallowRef<FieldGraph>();
const selectionState = ref<'selecting'|'dragging'>();

const getTileViewport = (): { left: number, top: number, right: number, bottom: number } => {
  const { columns, rows } = dimensions;
  const left = Math.max(0, Math.floor(viewX.value / TILE_SIZE));
  const top = Math.max(0, Math.floor(viewY.value / TILE_SIZE));
  const right = Math.min(columns, Math.ceil((viewX.value + canvasWidth.value) / TILE_SIZE)) - 1;
  const bottom = Math.min(rows, Math.ceil((viewY.value + canvasHeight.value) / TILE_SIZE)) - 1;
  return { left, top, right, bottom };
};

const renderBackground = () => {
  const ctx = canvasLayers['background']?.getContext('2d');
  if (!ctx)
    throw new Error("Could not get background canvas context");
  canvasDirty.value = true;
  const { columns, rows } = dimensions;
  const [ minCol, maxCol ] = field.value.getMinMaxColumns();
  const { left, top, right, bottom } = getTileViewport();
  // Background colour
  ctx.fillStyle = '#959595';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-viewX.value, -viewY.value);
  // Draw grid lines
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#818181';
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
  ctx.restore();
  // Draw pin column boundaries
  ctx.fillStyle = 'rgba(0,0,0,calc(20/255))';
  ctx.fillRect(0, 0, minCol * TILE_SIZE + 1, rows * TILE_SIZE + 1);
  ctx.fillRect((maxCol + 1) * TILE_SIZE, 0, (columns - maxCol - 1) * TILE_SIZE, rows * TILE_SIZE);
  // Draw border
  ctx.strokeStyle = '#000';
  ctx.strokeRect(0.5, 0.5, columns * TILE_SIZE, rows * TILE_SIZE);
  ctx.restore();
};

const renderTiles = (
  options: {
    metal?: boolean; // Render metal layer
    silicon?: boolean; // Render silicon layer
    context2d?: CanvasRenderingContext2D; // Override context to render to
    field?: FieldGraph; // Override field to render
    bounds?: number[]; // Rendering bounds
    noTranslate?: boolean; // Disables view translation
  } = {}
) => {
  const contextSiliconTiles = options.context2d ?? canvasLayers['silicon-tiles']?.getContext('2d');
  const contextMetalTiles = options.context2d ?? canvasLayers['metal-tiles']?.getContext('2d');
  if (!contextSiliconTiles)
    throw new Error("Could not get silicon-tiles canvas context");
  if (!contextMetalTiles)
    throw new Error("Could not get metal-tiles canvas context");
  canvasDirty.value = true;
  const data = (options.field ?? field.value).getData();
  const { columns, rows } = options.field?.getDimensions() ?? dimensions;
  const { metal: showMetal, silicon: showSilicon, bounds, noTranslate } = Object.assign(
    { metal: true, silicon: true },
    options
  );
  const tileViewport = getTileViewport();
  let [ left, top, right, bottom ] = bounds ?? [
    tileViewport.left,
    tileViewport.top,
    tileViewport.right,
    tileViewport.bottom,
  ];
  left = Math.max(0, left - 2);
  top = Math.max(0, top - 2);
  right = Math.min(columns - 1, right + 2);
  bottom = Math.min(rows - 1, bottom + 2);
  if (!options.context2d) {
    if (bounds) {
      contextSiliconTiles.clearRect(
        -viewX.value + (left * TILE_SIZE) + 1,
        -viewY.value + (top * TILE_SIZE) + 1,
        (right - left + 1) * TILE_SIZE,
        (bottom - top + 1) * TILE_SIZE,
      );
      contextMetalTiles.clearRect(
        -viewX.value + (left * TILE_SIZE) + 1,
        -viewY.value + (top * TILE_SIZE) + 1,
        (right - left + 1) * TILE_SIZE ,
        (bottom - top + 1) * TILE_SIZE,
      );
    } else {
      contextSiliconTiles.clearRect(0, 0, contextSiliconTiles.canvas.width, contextSiliconTiles.canvas.height);
      contextMetalTiles.clearRect(0, 0, contextMetalTiles.canvas.width, contextMetalTiles.canvas.height);
    }
  }
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
    !noTranslate && ctx.translate(-viewX.value, -viewY.value);
    !noTranslate && ctx.translate(left*TILE_SIZE+1, top*TILE_SIZE+1);
    ctx.strokeStyle = '#060000';
    // Silicon layer + vias
    for (let x = left; x <= right; x++) {
      ctx.save();
      for (let y = top; y <= bottom; y++) {
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
    const { renderTile, getDirectionX, getDirectionY } = useTileRenderer(ctx);
    const metalLayer = data.getLayer(Layer.Metal);
    const metalConnHLayer = data.getLayer(Layer.MetalConnectionsH);
    const metalConnVLayer = data.getLayer(Layer.MetalConnectionsV);
    ctx.save();
    !noTranslate && ctx.translate(-viewX.value, -viewY.value);
    !noTranslate && ctx.translate(left * TILE_SIZE + 1, top * TILE_SIZE + 1);
    for (let x = left; x <= right; x++) {
      ctx.save();
      for (let y = top; y <= bottom; y++) {
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
};

const renderHot = (
  options: { metal?: boolean; silicon?: boolean } = {
    metal: true,
    silicon: true,
  }
) => {
  const net = network.value;
  const ctxMetalHot = canvasLayers['metal-hot']?.getContext('2d');
  const ctxSiliconHot = canvasLayers['silicon-hot']?.getContext('2d');
  if (!ctxMetalHot)
    throw new Error("Could not get metal-hot canvas context");
  if (!ctxSiliconHot)
    throw new Error("Could not get silicon-hot canvas context");
  canvasDirty.value = true;
  const { metal: showMetal, silicon: showSilicon } = Object.assign(
    { metal: false, silicon: false },
    options
  );
  const { left, top, right, bottom } = getTileViewport();
  ctxMetalHot.clearRect(0, 0, ctxMetalHot.canvas.width, ctxMetalHot.canvas.height);
  ctxSiliconHot.clearRect(0, 0, ctxSiliconHot.canvas.width, ctxSiliconHot.canvas.height);
  ctxMetalHot.save();
  ctxSiliconHot.save();
  ctxMetalHot.translate(-viewX.value, -viewY.value);
  ctxSiliconHot.translate(-viewX.value, -viewY.value);
  ctxMetalHot.translate(1, 1);
  ctxSiliconHot.translate(1, 1);
  // Draw current
  if (isRunning.value) {
    const hotImage = images.findImage('/tiles/hot.png');
    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        if (showSilicon) {
          const nodes = net.getNodesAt([x, y], 'silicon');
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
            ctxSiliconHot.drawImage(hotImage, x * TILE_SIZE, y * TILE_SIZE);
          }
        }
        if (showMetal) {
          const nodes = net.getNodesAt([x, y], 'metal');
          const hot = nodes.some(n => {
            if (n instanceof PathNode) {
              return n.state;
            }
            return false;
          });
          if (hot) {
            ctxMetalHot.drawImage(hotImage, x * TILE_SIZE, y * TILE_SIZE);
          }
        }
      }
    }
  }
  ctxMetalHot.restore();
  ctxSiliconHot.restore();
};

const renderOverlay = () => {
  const ctx = canvasLayers['overlay'].getContext('2d');
  if (!ctx)
    throw new Error("Could not get overlay canvas context");
  const net = network.value;
  canvasDirty.value = true;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-viewX.value, -viewY.value);
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
  // Draw selection
  if (!isRunning.value) {
    if (selectionStart.value && selectionEnd.value) {
      ctx.save();
      ctx.translate(0.5, 0.5);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      const [ left, top, right, bottom ] = selectionBounds.value ?? [ 0, 0, 0, 0];
      const [ ox, oy ] = selectionTranslate.value ?? [ 0, 0 ];
      const width = (right - left) + 1;
      const height = (bottom - top) + 1;
      ctx.translate(Math.floor(left + ox) * TILE_SIZE, Math.floor(top + oy) * TILE_SIZE);
      ctx.strokeRect(0, 0, width * TILE_SIZE, height * TILE_SIZE);
      ctx.restore();
    }
    if (selectionData.value) {
      ctx.save();
      const [ left, top ] = selectionBounds.value ?? [ 0, 0 ];
      const [ tx, ty ] = selectionTranslate.value ?? [ 0, 0 ];
      ctx.translate(Math.floor((left + tx - 1) * TILE_SIZE), Math.floor((top + ty - 1) * TILE_SIZE));
      renderTiles({ context2d: ctx, field: selectionData.value, noTranslate: true });
      ctx.restore();
    }
  }
  // Draw pin labels
  ctx.fillStyle = '#000';
  ctx.font = '10px Georgia10';
  const pinNodes = net.getPinNodes();
  const textPadX = 3;
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [ x, y ] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    const tx = x * TILE_SIZE + textPadX;
    const ty = y * TILE_SIZE + 10;
    const tw = (TILE_SIZE * 3) - (textPadX * 2);
    ctx.fillText(label, tx, ty, tw);
  }
  ctx.restore();
};

const renderAll = () => {
  renderBackground();
  renderTiles();
  renderHot();
  renderOverlay();
};

const draw = (mode: ToolboxMode, coordA: Point, coordB: Point) => {
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
  }
  updateDesignScoreThrottle();
  const bounds = [
    Math.min(coordA[0], coordB[0]),
    Math.min(coordA[1], coordB[1]),
    Math.max(coordA[0], coordB[0]),
    Math.max(coordA[1], coordB[1]),
  ];
  queueAnimFuncs.add(() => renderTiles({ bounds }));
};

const panView = (dx: number, dy: number) => {
  const { minX, minY, maxX, maxY } = viewBounds.value;
  viewX.value = Math.max(minX, Math.min(maxX, viewX.value + dx));
  viewY.value = Math.max(minY, Math.min(maxY, viewY.value + dy));
  // TODO: Draw only the parts that need to be drawn for performance on large fields+screens.
  queueAnimFuncs.add(renderAll);
};

const resetView = () => {
  const { columns, rows } = dimensions;
  const { minX, minY, maxX, maxY } = viewBounds.value;
  viewX.value = fieldWidth.value < canvasWidth.value ?
    Math.max(minX, Math.min(maxX, -Math.trunc((canvasWidth.value - columns * TILE_SIZE) / 2))) :
    0;
  viewY.value = fieldHeight.value < canvasHeight.value ?
    Math.max(minY, Math.min(maxY, -Math.trunc((canvasHeight.value - rows * TILE_SIZE) / 2))) :
    0;
}

const invalidateCanvasSizes = () => {
  if (!canvas.value)
    return;
  const { clientWidth, clientHeight } = canvas.value;
  canvasWidth.value = Math.trunc(clientWidth);
  canvasHeight.value = Math.trunc(clientHeight);
  canvas.value.width = canvasWidth.value;
  canvas.value.height = canvasHeight.value;
  for (const canvas of Object.values(canvasLayers)) {
    if (!canvas)
      continue;
    canvas.width = canvasWidth.value;
    canvas.height = canvasHeight.value;
  }
};

const mouseToGrid = (mx: number, my: number): Point => {
  if (!canvas.value)
    return [0, 0];
  const x = Math.floor((mx + viewX.value) / TILE_SIZE);
  const y = Math.floor((my + viewY.value) / TILE_SIZE);
  return [x, y];
};

const clampCoords = (coord: Point): Point => {
  const { rows } = dimensions;
  const [ min, max ] = field.value.getMinMaxColumns();
  const [ x, y ] = coord;
  return [
    Math.max(min, Math.min(max, x)),
    Math.max(0, Math.min(rows - 1, y)),
  ];
}

const startDraw = (e: MouseEvent) => {
  const mouseCoords = mouseToGrid(e.offsetX, e.offsetY);
  isDrawing.value = true;
  prevDrawingCoords = mouseCoords;
  draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
}

const startSelection = (e: MouseEvent) => {
  const mouseCoords = mouseToGrid(e.offsetX, e.offsetY);
  if (coordInSelection(mouseCoords)) {
    selectionData.value = field.value.copy(selectionStart.value!, selectionEnd.value!);
    selectionState.value = 'dragging';
  } else {
    selectionStart.value = clampCoords(mouseCoords);
    selectionEnd.value = clampCoords(mouseCoords);
    selectionTranslate.value = [ 0, 0 ];
    selectionState.value = 'selecting';
  }
}

const endSelection = (e: MouseEvent) => {
  
  if (selectionState.value === 'selecting') {
    selectionState.value = undefined;
  }
  if (selectionState.value === 'dragging') {
    // TODO try place selection data or reset selection to original position
    console.log("TODO: Paste selection in place", selectionStart, selectionEnd, selectionTranslate)
    selectionState.value = undefined;

    // if placed failed:
    selectionTranslate.value = [0, 0];
    selectionData.value = undefined;

    // if placed successfully:
    //selectionStart.value = undefined;
    //selectionEnd.value = undefined;
    //selectionTranslate.value = undefined;
  } 
}

const coordInSelection = (coord: Point) => {
  const [ x, y ] = coord;
  if (!selectionBounds.value)
    return false;
  const [ left, top, right, bottom ] = selectionBounds.value;
  return x >= left && x <= right && y >= top && y <= bottom;
}

const onMouseDown = (e: MouseEvent) => {
  if (!canvas.value)
    return;
  e.preventDefault();
  switch (e.button) {
    case 0:
      if (!isRunning.value) {
        if (toolBoxMode.value === 'select') {
          startSelection(e);
        } else {
          startDraw(e);
        }
      }
      break;
    case 2:
      isPanning.value = true;
      break;
  }
};

watch([ canvasMouseX, canvasMouseY ], ([ x, y ], [ oldX, oldY ]) => {
  const dx = x - oldX;
  const dy = y - oldY;
  const coords = mouseToGrid(x, y);
  if (isDrawing.value) {
    if (!isRunning.value) {
      draw(toolBoxMode.value, prevDrawingCoords, coords);
      prevDrawingCoords = coords;
    }
  } else if (isPanning.value) {
    panView(-dx, -dy);
  } else if (selectionState.value) {
    if (selectionState.value === 'dragging') {
      if (selectionTranslate.value) {
        selectionTranslate.value[0] += dx / TILE_SIZE;
        selectionTranslate.value[1] += dy / TILE_SIZE;
      }
    } else if (selectionState.value === 'selecting') {
      selectionEnd.value = clampCoords(coords);
    }
  }
});

watch([selectionData, selectionStart, selectionEnd, selectionTranslate], () => {
  queueAnimFuncs.add(renderOverlay);
}, { deep: true });

watch(toolBoxMode, (mode, was) => {
  if (was === 'select') {
    selectionData.value = undefined;
    selectionStart.value = undefined;
    selectionEnd.value = undefined;
    selectionTranslate.value = undefined;
  }
});

useEventListener('mouseup', (e) => {
  if (!canvas.value)
    return;
  switch (e.button) {
    case 0:
      isDrawing.value = false;
      endSelection(e);
      break;
    case 2:
      isPanning.value = false;
      break;
  }
});

useResizeObserver(canvas, (entries, obs) => {
  invalidateCanvasSizes();
  queueAnimFuncs.add(renderAll);
});

useRafFn(({ delta, timestamp }) => {
  const start = performance.now();
  queueAnimFuncs.forEach(fn => fn());
  queueAnimFuncs.clear();
  if (!canvasDirty.value)
    return;
  canvasDirty.value = false;
  const ctx = canvas.value?.getContext('2d');
  if (!ctx)
    throw new Error('Could not get primary canvas context');
  const { width, height } = ctx.canvas;
  ctx.drawImage(canvasLayers['background'], 0, 0, width, height);
  ctx.drawImage(canvasLayers['silicon-tiles'], 0, 0, width, height);
  ctx.drawImage(canvasLayers['silicon-hot'], 0, 0, width, height);
  ctx.drawImage(canvasLayers['metal-tiles'], 0, 0, width, height);
  ctx.drawImage(canvasLayers['metal-hot'], 0, 0, width, height);
  ctx.drawImage(canvasLayers['overlay'], 0, 0, width, height);
  perfRenderTime.value = performance.now() - start;
});

onCircuitRender(() => {
  queueAnimFuncs.add(renderHot);
});

watch(isRunning, (isRunning) => {
  queueAnimFuncs.add(renderHot);
});

watch(
  [ sim, circuitFactory ],
  async ([ sim, factory ], [ oldSim, oldFactory ]) => {
    await nextTick(); // Wait for resize observer to update canvas size
    if (factory !== oldFactory) {
      invalidateCanvasSizes();
      resetView();
    }
    queueAnimFuncs.add(renderAll);
  }
);

watch(canvas, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx)
    return;
  ctx.imageSmoothingEnabled = false;
  invalidateCanvasSizes();
  resetView();
  queueAnimFuncs.add(renderAll);
});

</script>
