import { FieldGraph, type Point } from '@/simulation';

// TODO: This composable is a mess

export type SelectionState =
  | 'selecting'
  | 'selected'
  | 'dragging'
  | 'dragging-duplicate';

const state = ref<SelectionState>();
const start = ref<Point>();
const end = ref<Point>();
const bounds = computed<
  [left: number, top: number, right: number, bottom: number] | undefined
>(() => {
  if (!start.value || !end.value) return undefined;
  const [sx, sy] = start.value;
  const [ex, ey] = end.value;
  return [
    Math.min(sx, ex),
    Math.min(sy, ey),
    Math.max(sx, ex),
    Math.max(sy, ey),
  ];
});
const translate = ref<Point>();
const fieldGraph = shallowRef<FieldGraph>();
const isSnippet = ref(false);

const fieldCanvas = ref<HTMLCanvasElement | null>(null);
const fieldView = ref<Point>([0, 0]);
const { elementX: canvasMouseX, elementY: canvasMouseY } =
  useMouseInElement(fieldCanvas);
const coordMouseX = computed(() => Math.floor(canvasMouseX.value / TILE_SIZE));
const coordMouseY = computed(() => Math.floor(canvasMouseY.value / TILE_SIZE));

function computeTranslationFromMouse(): Point {
  const viewX = Math.ceil(fieldView.value[0] / TILE_SIZE) || 0;
  const viewY = Math.ceil(fieldView.value[1] / TILE_SIZE) || 0;
  const { columns = 0, rows = 0 } = fieldGraph.value?.getDimensions() || {};
  return [
    coordMouseX.value + viewX - columns / 2,
    coordMouseY.value + viewY - rows / 2,
  ];
}

export default function useSelection(setup?: {
  canvas: Ref<HTMLCanvasElement | null>;
  viewX: Ref<number>;
  viewY: Ref<number>;
}) {
  if (setup) {
    const { canvas, viewX, viewY } = setup;
    watch(canvas, (newCanvas) => {
      fieldCanvas.value = newCanvas;
    });
    watch([viewX, viewY], ([newViewX, newViewY]) => {
      fieldView.value[0] = newViewX;
      fieldView.value[1] = newViewY;
    });
  }
  return {
    computeTranslationFromMouse,
    state,
    start,
    end,
    bounds,
    translate,
    fieldGraph,
    isSnippet,
  };
}
