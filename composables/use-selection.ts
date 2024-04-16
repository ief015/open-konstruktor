import { FieldGraph, Point } from "@/simulation";

export type SelectionState = 'selecting' | 'selected' | 'dragging';

const state = ref<SelectionState>();
const start = ref<Point>();
const end = ref<Point>();
const bounds = computed<[
  left: number,
  top: number,
  right: number,
  bottom: number
]|undefined>(() => {
  if (!start.value || !end.value)
    return undefined;
  const [ sx, sy ] = start.value;
  const [ ex, ey ] = end.value;
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

const fieldView = ref<Point>([0, 0]); // TODO: hacky, gets updated by watch on FieldGraph.

export default function useSelection() {
  return {
    state,
    start,
    end,
    bounds,
    translate,
    fieldGraph,
    isSnippet,
    fieldView,
  };
}
