<template>
  <div class="relative w-full h-full">
    <canvas
      ref="canvas"
      id="field-canvas"
      class="absolute w-full h-full"
      @mousedown="onMouseDown"
      oncontextmenu="return false;"
    >
      Your browser must support the canvas tag.
    </canvas>
    <div class="absolute w-full h-full pointer-events-none select-none">
      <div class="flex flex-col justify-end w-full h-full">
        <div
          class="font-georgia12 text-[12px] text-black m-1"
          v-html="debugMsg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldGraph } from '@/simulation';
import type { Point } from '@/simulation';
import type { ToolboxMode } from '@/composables/use-toolbox';
import { MenuBarActionEvent } from '@/components/menu/bar-app-events';
import { BackgroundGridRenderer } from '@/render/BackgroundGridRenderer';
import { FieldRenderer, type TileBounds } from '@/render/FieldRenderer';

const canvas = useTemplateRef('canvas');
const canvasDirty = ref(false);
const canvasLayers = {
  background: document.createElement('canvas'),
  'silicon-tiles': document.createElement('canvas'),
  'silicon-hot': document.createElement('canvas'),
  'metal-tiles': document.createElement('canvas'),
  'metal-hot': document.createElement('canvas'),
  overlay: document.createElement('canvas'),
};

const gridRenderer = new BackgroundGridRenderer(canvasLayers['background']);
const fieldRenderer = new FieldRenderer().applyCanvases({
  metal: canvasLayers['metal-tiles'],
  silicon: canvasLayers['silicon-tiles'],
  metalHot: canvasLayers['metal-hot'],
  siliconHot: canvasLayers['silicon-hot'],
});
const selectionFieldRenderer = new FieldRenderer().setCanvas(
  canvasLayers['overlay'],
);

const { TILE_SIZE } = FieldRenderer;

const {
  field,
  dimensions,
  updateDesignScore,
  history,
  resetVerificationResult,
} = useFieldGraph();
const updateDesignScoreThrottle = useThrottleFn(updateDesignScore, 1000, true);
const {
  sim,
  network,
  circuitFactory,
  isRunning,
  stepsPerSecond,
  onRender: onCircuitRender,
} = useCircuitSimulator();
const { mode: toolBoxMode, ignoreKeyShortcuts } = useToolbox();

const canvasWidth = ref(0);
const canvasHeight = ref(0);
const fieldWidth = computed(() => dimensions.columns * TILE_SIZE);
const fieldHeight = computed(() => dimensions.rows * TILE_SIZE);

const viewX = ref(0);
const viewY = ref(0);
const viewBounds = computed(() => {
  const minX = Math.min(
    fieldWidth.value - canvasWidth.value + 1,
    Math.trunc(fieldWidth.value / 2),
    0,
  );
  const minY = Math.min(
    fieldHeight.value - canvasHeight.value + 1,
    Math.trunc(fieldHeight.value / 2),
    0,
  );
  const maxX = Math.max(fieldWidth.value - canvasWidth.value + 1, 0);
  const maxY = Math.max(fieldHeight.value - canvasHeight.value + 1, 0);
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
});

const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
  isOutside: canvasMouseOutside,
} = useMouseInElement(canvas);
const coordMouseX = computed(() =>
  Math.floor((canvasMouseX.value + viewX.value) / TILE_SIZE),
);
const coordMouseY = computed(() =>
  Math.floor((canvasMouseY.value + viewY.value) / TILE_SIZE),
);
const isDrawing = ref(false);
const isPanning = ref(false);
let prevDrawingCoords: Point = [0, 0];

const perfRenderTime = ref(0);
const debugFlags = reactive({
  // TODO: UI to toggle debug flags?
  enabled: true,
  showMouseCanvasPosition: false,
  showMouseGridPosition: true,
  showLayersDataAtMouse: false,
  showGridSize: false,
  showViewPosition: false,
  showViewBounds: false,
  showRenderTime: true,
  showStepsPerSecond: true,
});
const debugMsg = computed(() => {
  if (!debugFlags.enabled) return '';
  const dbg: string[] = [];
  if (!canvasMouseOutside.value) {
    if (debugFlags.showMouseCanvasPosition) {
      const mouseX = canvasMouseX.value.toFixed(0);
      const mouseY = canvasMouseY.value.toFixed(0);
      dbg.push(`Mouse: [${mouseX}, ${mouseY}]`);
    }
    if (debugFlags.showMouseGridPosition) {
      const coordX = coordMouseX.value;
      const coordY = coordMouseY.value;
      dbg.push(`Coord: [${coordX}, ${coordY}]`);
    }
    if (debugFlags.showLayersDataAtMouse) {
      const layers = field.value?.getData()?.getLayers();
      if (layers) {
        const layersInfo = layers.map(
          (layer, idx) =>
            `${idx}:${layer[coordMouseX.value]?.[coordMouseY.value] ?? '?'}`,
        );
        dbg.push(`Layers: ${layersInfo.join(' ')}`);
      }
    }
  }
  if (debugFlags.showGridSize) {
    dbg.push(`Grid: [${dimensions.columns}, ${dimensions.rows}]`);
  }
  if (debugFlags.showViewPosition) {
    const panX = viewX.value.toFixed(0);
    const panY = viewY.value.toFixed(0);
    dbg.push(`View: [${panX}, ${panY}]`);
  }
  if (debugFlags.showViewBounds) {
    const { minX, minY, maxX, maxY } = viewBounds.value;
    dbg.push(`View Bounds: min=[${minX}, ${minY}] max=[${maxX}, ${maxY}]`);
  }
  if (debugFlags.showRenderTime) {
    dbg.push(`Last render ms: ${perfRenderTime.value.toFixed(2)}`);
  }
  if (debugFlags.showStepsPerSecond) {
    dbg.push(`Steps/s: ${stepsPerSecond.value.toFixed(2)}`);
  }
  return dbg.join('<br/>');
});

const queueAnimFuncs: Set<() => void> = new Set();

const {
  state: selectionState,
  start: selectionStart,
  end: selectionEnd,
  bounds: selectionBounds,
  translate: selectionTranslate,
  fieldGraph: selectionFieldGraph,
  isSnippet: selectionIsSnippet,
  fieldView: selectionFieldView,
} = useSelection();
watch([viewX, viewY], ([x, y]) => (selectionFieldView.value = [x, y])); // TODO: yuck, crappy way of providing viewX and viewY to the selection composable

const getTileViewport = (): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} => {
  const { columns, rows } = dimensions;
  const left = Math.max(0, Math.floor(viewX.value / TILE_SIZE));
  const top = Math.max(0, Math.floor(viewY.value / TILE_SIZE));
  const right =
    Math.min(
      columns,
      Math.ceil((viewX.value + canvasWidth.value) / TILE_SIZE),
    ) - 1;
  const bottom =
    Math.min(rows, Math.ceil((viewY.value + canvasHeight.value) / TILE_SIZE)) -
    1;
  return { left, top, right, bottom };
};

const renderBackground = () => {
  const ctx = gridRenderer.getContext();
  const [minCol, maxCol] = field.value.getMinMaxColumns();
  gridRenderer.applyDefinition({
    columns: dimensions.columns,
    rows: dimensions.rows,
    boundaryLeft: minCol,
    boundaryRight: dimensions.columns - maxCol,
  });
  ctx.save();
  ctx.translate(-viewX.value, -viewY.value);
  gridRenderer.render(getTileViewport());
  ctx.restore();
  canvasDirty.value = true;
};

const renderField = (bounds?: TileBounds) => {
  const ctxSilicon = fieldRenderer.getContext('silicon');
  const ctxMetal = fieldRenderer.getContext('metal');
  ctxSilicon.save();
  ctxMetal.save();
  ctxSilicon.translate(-viewX.value, -viewY.value);
  ctxMetal.translate(-viewX.value, -viewY.value);
  fieldRenderer.render({
    field: field.value,
    metal: true,
    silicon: true,
    bounds: bounds,
  });
  ctxSilicon.restore();
  ctxMetal.restore();
  canvasDirty.value = true;
};

const renderHot = () => {
  const ctxSilicon = fieldRenderer.getContext('siliconHot');
  const ctxMetal = fieldRenderer.getContext('metalHot');
  ctxSilicon.save();
  ctxMetal.save();
  ctxSilicon.translate(-viewX.value, -viewY.value);
  ctxMetal.translate(-viewX.value, -viewY.value);
  fieldRenderer.render({
    field: field.value,
    network: network.value,
    metalHot: true,
    siliconHot: true,
  });
  ctxSilicon.restore();
  ctxMetal.restore();
  canvasDirty.value = true;
};

const renderOverlay = () => {
  const ctx = canvasLayers['overlay'].getContext('2d');
  if (!ctx) throw new Error('Could not get overlay canvas context');
  const net = network.value;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(-viewX.value, -viewY.value);
  if (!isRunning.value) {
    // Draw selection box
    if (selectionStart.value && selectionEnd.value) {
      ctx.save();
      ctx.translate(0.5, 0.5);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      const [left, top, right, bottom] = selectionBounds.value ?? [0, 0, 0, 0];
      const [ox, oy] = selectionTranslate.value ?? [0, 0];
      const width = right - left + 1;
      const height = bottom - top + 1;
      ctx.translate(
        Math.round(left + ox) * TILE_SIZE,
        Math.round(top + oy) * TILE_SIZE,
      );
      ctx.strokeRect(0, 0, width * TILE_SIZE, height * TILE_SIZE);
      ctx.restore();
    }
    // Draw selection field tiles
    if (
      selectionFieldGraph.value &&
      (selectionState.value === 'dragging' ||
        selectionState.value === 'dragging-duplicate')
    ) {
      ctx.save();
      ctx.translate(1, 1);
      const [left, top] = selectionBounds.value ?? [0, 0];
      const [tx, ty] = selectionTranslate.value ?? [0, 0];
      ctx.translate(
        Math.floor((left + tx) * TILE_SIZE),
        Math.floor((top + ty) * TILE_SIZE),
      );
      selectionFieldRenderer.render({
        field: selectionFieldGraph.value,
        metal: true,
        silicon: true,
      });
      ctx.restore();
    }
  }
  // Draw pin labels
  ctx.fillStyle = '#000';
  ctx.font = '10px Georgia10';
  const pinNodes = net.getPinNodes();
  const textPadX = 3;
  for (let pid = 0; pid < pinNodes.length; pid++) {
    const [x, y] = field.value.getPinPoint(pid);
    const { label } = pinNodes[pid];
    const tx = x * TILE_SIZE + textPadX;
    const ty = y * TILE_SIZE + 10;
    const tw = TILE_SIZE * 3 - textPadX * 2;
    ctx.fillText(label, tx, ty, tw);
  }
  ctx.restore();
  canvasDirty.value = true;
};

const tilePreloader = useTileRenderer();
const renderAll = async () => {
  await tilePreloader.preloadImages();
  renderBackground();
  renderField();
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
      field.value.erase(['metal', 'silicon', 'via'], coordA, coordB);
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
  resetVerificationResult();
  const bounds: TileBounds = [
    Math.min(coordA[0], coordB[0]),
    Math.min(coordA[1], coordB[1]),
    Math.max(coordA[0], coordB[0]),
    Math.max(coordA[1], coordB[1]),
  ];
  queueAnimFuncs.add(() => renderField(bounds));
};

const clear = () => {
  if (isRunning.value) return;
  field.value.clearRect([0, 0], [dimensions.columns, dimensions.rows], {
    enforceBounds: true,
  });
  updateDesignScore();
  resetVerificationResult();
  queueAnimFuncs.add(renderAll);
  history.push();
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
  viewX.value =
    fieldWidth.value < canvasWidth.value
      ? Math.max(
          minX,
          Math.min(
            maxX,
            -Math.trunc((canvasWidth.value - columns * TILE_SIZE) / 2),
          ),
        )
      : 0;
  viewY.value =
    fieldHeight.value < canvasHeight.value
      ? Math.max(
          minY,
          Math.min(
            maxY,
            -Math.trunc((canvasHeight.value - rows * TILE_SIZE) / 2),
          ),
        )
      : 0;
};

const updateCanvasSizes = () => {
  if (!canvas.value) return;
  const { clientWidth, clientHeight } = canvas.value;
  canvasWidth.value = Math.trunc(clientWidth);
  canvasHeight.value = Math.trunc(clientHeight);
  canvas.value.width = canvasWidth.value;
  canvas.value.height = canvasHeight.value;
  for (const canvas of Object.values(canvasLayers)) {
    if (!canvas) continue;
    canvas.width = canvasWidth.value;
    canvas.height = canvasHeight.value;
  }
};

const mouseToGrid = (mx: number, my: number): Point => {
  if (!canvas.value) return [0, 0];
  const x = Math.floor((mx + viewX.value) / TILE_SIZE);
  const y = Math.floor((my + viewY.value) / TILE_SIZE);
  return [x, y];
};

const clampCoords = (coord: Point): Point => {
  const { rows } = dimensions;
  const [min, max] = field.value.getMinMaxColumns();
  const [x, y] = coord;
  return [Math.max(min, Math.min(max, x)), Math.max(0, Math.min(rows - 1, y))];
};

const startDraw = (e: MouseEvent) => {
  const mouseCoords = mouseToGrid(e.offsetX, e.offsetY);
  isDrawing.value = true;
  prevDrawingCoords = mouseCoords;
  draw(toolBoxMode.value, prevDrawingCoords, prevDrawingCoords);
};

const endDraw = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  history.push();
};

const startPan = (e: MouseEvent) => {
  isPanning.value = true;
};

const endPan = (e: MouseEvent) => {
  isPanning.value = false;
};

const startSelection = (e: MouseEvent) => {
  if (
    selectionState.value === 'dragging' ||
    selectionState.value === 'dragging-duplicate'
  )
    return;
  const mouseCoords = mouseToGrid(e.offsetX, e.offsetY);
  if (coordInSelection(mouseCoords)) {
    const [left, top, right, bottom] = selectionBounds.value!;
    const start: Point = [left, top];
    const end: Point = [right, bottom];
    if (!e.shiftKey) {
      field.value.clearRect(start, end, { enforceBounds: true });
      selectionState.value = 'dragging';
    } else {
      selectionState.value = 'dragging-duplicate';
    }
    queueAnimFuncs.add(renderField);
    queueAnimFuncs.add(renderOverlay);
  } else {
    selectionStart.value = clampCoords(mouseCoords);
    selectionEnd.value = clampCoords(mouseCoords);
    selectionTranslate.value = [0, 0];
    selectionState.value = 'selecting';
  }
};

const clearSelection = () => {
  selectionStart.value = undefined;
  selectionEnd.value = undefined;
  selectionTranslate.value = undefined;
  selectionFieldGraph.value = undefined;
  selectionIsSnippet.value = false;
  selectionState.value = undefined;
};

const endSelection = () => {
  switch (selectionState.value) {
    case 'selecting': {
      const [left, top, right, bottom] = selectionBounds.value!;
      const start: Point = [left, top];
      const end: Point = [right, bottom];
      selectionFieldGraph.value = field.value.copy(start, end, {
        enforceBounds: true,
      });
      selectionState.value = 'selected';
      break;
    }
    case 'selected': {
      clearSelection();
      break;
    }
    case 'dragging':
    case 'dragging-duplicate': {
      const lastState = selectionState.value;
      selectionState.value = undefined;
      if (selectionFieldGraph.value && selectionBounds.value) {
        const [left, top, right, bottom] = selectionBounds.value;
        const [ox, oy] = selectionTranslate.value ?? [0, 0];
        const pasteStart: Point = [Math.round(left + ox), Math.round(top + oy)];
        const pasteEnd: Point = [
          Math.round(right + ox),
          Math.round(bottom + oy),
        ];
        const success = field.value.paste(
          pasteStart,
          selectionFieldGraph.value,
        );
        if (success) {
          selectionState.value = 'selected';
          selectionStart.value = clampCoords(pasteStart);
          selectionEnd.value = clampCoords(pasteEnd);
          selectionIsSnippet.value = false;
          selectionTranslate.value = [0, 0];
          selectionFieldGraph.value = field.value.copy(pasteStart, pasteEnd, {
            enforceBounds: true,
          });
        } else {
          if (selectionIsSnippet.value) {
            // Continue dragging the snippet
            selectionState.value = lastState;
          } else {
            // Force the selection back to its original position
            if (lastState === 'dragging') {
              field.value.paste([left, top], selectionFieldGraph.value, {
                overwrite: true,
              });
            }
            selectionTranslate.value = [0, 0];
          }
        }
        history.push();
        queueAnimFuncs.add(renderField);
      } else {
        clearSelection();
      }
      break;
    }
  }
};

const onKeyDownModifySelection = (e: KeyboardEvent) => {
  if (!selectionFieldGraph.value) return;
  let modified = true;
  switch (e.key.toLowerCase()) {
    case 'f':
      if (e.shiftKey) {
        selectionFieldGraph.value.flipVertical();
      } else {
        selectionFieldGraph.value.flipHorizontal();
      }
      queueAnimFuncs.add(renderOverlay);
      break;
    case 'r':
      if (
        selectionState.value === 'dragging' ||
        selectionState.value === 'dragging-duplicate'
      ) {
        if (e.shiftKey) {
          selectionFieldGraph.value.rotateCCW();
        } else {
          selectionFieldGraph.value.rotateCW();
        }
        const { columns, rows } = selectionFieldGraph.value.getDimensions();
        selectionEnd.value = [
          selectionStart.value![0] + columns - 1,
          selectionStart.value![1] + rows - 1,
        ];
        queueAnimFuncs.add(renderOverlay);
      } else {
        modified = false;
        console.log('Rotate only works when dragging a selection');
      }
      break;
    default:
      modified = false;
      break;
  }
  if (modified && selectionState.value === 'selected') {
    const [left, top, right, bottom] = selectionBounds.value!;
    const start: Point = [left, top];
    const end: Point = [right, bottom];
    field.value.clearRect(start, end, { enforceBounds: true });
    field.value.paste(start, selectionFieldGraph.value);
    queueAnimFuncs.add(renderField);
    history.push();
  }
};

function deleteSelection() {
  if (isRunning.value) return;
  if (!selectionBounds.value) return;
  const [left, top, right, bottom] = selectionBounds.value!;
  const start: Point = [left, top];
  const end: Point = [right, bottom];
  if (
    selectionState.value === 'selecting' ||
    selectionState.value === 'selected'
  ) {
    field.value.clearRect(start, end, { enforceBounds: true });
  }
  selectionFieldGraph.value = undefined;
  endSelection();
  queueAnimFuncs.add(renderField);
  queueAnimFuncs.add(renderOverlay);
  history.push();
}

function undo() {
  if (isRunning.value) return;
  history.undo();
  updateDesignScore();
  resetVerificationResult();
  queueAnimFuncs.add(renderAll);
}

function redo() {
  if (isRunning.value) return;
  history.redo();
  updateDesignScore();
  resetVerificationResult();
  queueAnimFuncs.add(renderAll);
}

const onKeyDownDeleteSelection = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Delete':
    case 'Backspace':
      deleteSelection();
      break;
  }
};

const coordInSelection = (coord: Point) => {
  const [x, y] = coord;
  if (!selectionBounds.value) return false;
  const [left, top, right, bottom] = selectionBounds.value;
  return x >= left && x <= right && y >= top && y <= bottom;
};

const onMouseDown = (e: MouseEvent) => {
  if (!canvas.value) return;
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
      startPan(e);
      break;
  }
};

watch([canvasMouseX, canvasMouseY], ([x, y], [oldX, oldY]) => {
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
    switch (selectionState.value) {
      case 'dragging':
      case 'dragging-duplicate':
        if (selectionTranslate.value) {
          selectionTranslate.value[0] += dx / TILE_SIZE;
          selectionTranslate.value[1] += dy / TILE_SIZE;
        }
        break;
      case 'selecting':
        selectionEnd.value = clampCoords(coords);
        break;
    }
  }
});

watch(
  [selectionFieldGraph, selectionStart, selectionEnd, selectionTranslate],
  () => {
    queueAnimFuncs.add(renderOverlay);
  },
  { deep: true },
);

watch(toolBoxMode, (mode, was) => {
  if (was === 'select') {
    selectionFieldGraph.value = undefined;
    selectionStart.value = undefined;
    selectionEnd.value = undefined;
    selectionTranslate.value = undefined;
  }
});

useEventListener('mouseup', (e) => {
  if (!canvas.value) return;
  switch (e.button) {
    case 0:
      endDraw(e);
      break;
    case 2:
      endPan(e);
      break;
  }
});

useEventListener(canvas, 'mouseup', (e) => {
  switch (e.button) {
    case 0:
      endSelection();
      break;
  }
});

useEventListener('keydown', (e) => {
  if (ignoreKeyShortcuts.value) return;
  onKeyDownModifySelection(e);
  onKeyDownDeleteSelection(e);
});

useEventListener('keydown', (e) => {
  if (ignoreKeyShortcuts.value) return;
  if (e.key.toLowerCase() === 'z' && e.ctrlKey) {
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }
});

const clipboard = inject<ReturnType<typeof useClipboard>>('clipboard');

function cutSelectionToClipboard() {
  if (isRunning.value) return;
  if (!selectionFieldGraph.value) return;
  if (!clipboard) return;
  const data = selectionFieldGraph.value.toSaveString();
  clipboard.copy(data);
  const [left, top, right, bottom] = selectionBounds.value!;
  const start: Point = [left, top];
  const end: Point = [right, bottom];
  field.value.clearRect(start, end, { enforceBounds: true });
  endSelection();
  queueAnimFuncs.add(renderField);
  queueAnimFuncs.add(renderOverlay);
  history.push();
}

function copySelectionToClipboard() {
  if (!selectionFieldGraph.value) return;
  if (!clipboard) return;
  const data = selectionFieldGraph.value.toSaveString();
  clipboard.copy(data).then(() => console.log('copied', clipboard.text.value));
}

function pasteClipboard() {
  if (isRunning.value) return;
  if (!clipboard) return;
  try {
    console.log('paste', clipboard.text.value);
    if (!clipboard.text.value) return;
    const text = clipboard.text.value;
    const graph = FieldGraph.from(text, 'snippet');
    const { columns, rows } = graph.getDimensions();
    if (columns > 0 && rows > 0) {
      selectionFieldGraph.value = graph;
      selectionTranslate.value = [
        coordMouseX.value - columns / 2,
        coordMouseY.value - rows / 2,
      ];
      selectionStart.value = [0, 0];
      selectionEnd.value = [columns - 1, rows - 1];
      selectionIsSnippet.value = true;
      selectionState.value = 'dragging';
      toolBoxMode.value = 'select';
      queueAnimFuncs.add(renderOverlay);
    }
  } catch (err) {
    console.error('Failed to parse clipboard data as field graph', err);
  }
}

useEventListener('keydown', (e) => {
  if (ignoreKeyShortcuts.value) return;
  const k = e.key.toLowerCase();
  if (e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
    switch (k) {
      case 'c':
        copySelectionToClipboard();
        break;
      case 'x':
        cutSelectionToClipboard();
        break;
      case 'v': {
        pasteClipboard();
        break;
      }
    }
  }
});

useEventListener(
  document,
  MenuBarActionEvent.eventType,
  (event: MenuBarActionEvent) => {
    switch (event.id) {
      case 'view/reset':
        resetView();
        queueAnimFuncs.add(renderAll);
        break;
      case 'view/toggle-debug':
        debugFlags.enabled = !debugFlags.enabled;
        break;
      case 'edit/clear':
        clear();
        break;
      case 'edit/undo':
        undo();
        break;
      case 'edit/redo':
        redo();
        break;
      case 'edit/cut':
        cutSelectionToClipboard();
        break;
      case 'edit/copy':
        copySelectionToClipboard();
        break;
      case 'edit/paste':
        pasteClipboard();
        break;
      case 'edit/delete':
        deleteSelection();
        break;
    }
  },
);

useResizeObserver(canvas, (entries, obs) => {
  updateCanvasSizes();
  queueAnimFuncs.add(renderAll);
});

useRafFn(({ delta, timestamp }) => {
  const start = performance.now();
  queueAnimFuncs.forEach((fn) => fn());
  queueAnimFuncs.clear();
  if (!canvasDirty.value) return;
  canvasDirty.value = false;
  const ctx = canvas.value?.getContext('2d');
  if (!ctx) throw new Error('Could not get primary canvas context');
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

watch([sim, circuitFactory], async ([sim, factory], [oldSim, oldFactory]) => {
  await nextTick(); // Wait for resize observer to update canvas size
  if (factory !== oldFactory) {
    updateCanvasSizes();
    resetView();
  }
  queueAnimFuncs.add(renderAll);
});

watch(canvas, (canvas) => {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  updateCanvasSizes();
  resetView();
  queueAnimFuncs.add(renderAll);
});
</script>
