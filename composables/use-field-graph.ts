import { CircuitDesignData } from '@/serialization';
import type { LayerDimensions } from '@/serialization';
import { FieldGraph, type VerificationResult } from '@/simulation';

const field = shallowRef<FieldGraph>(new FieldGraph());
const dimensions = reactive<LayerDimensions>({ columns: 0, rows: 0 });
const designScore = ref(0);
const verificationResult = ref<VerificationResult | null>(null);

const updateDesignScore = () => {
  designScore.value = field.value.getDesignScore();
};

const setVerificationResult = (result: VerificationResult) => {
  verificationResult.value = result;
};

const resetVerificationResult = () => {
  verificationResult.value = null;
};

const updateDimensions = () => {
  const { columns, rows } = field.value.getDimensions();
  dimensions.columns = columns;
  dimensions.rows = rows;
};

const loadBlank = (
  columns?: number,
  rows?: number,
  pinRows?: number,
  clearHistory = true,
) => {
  const data = new CircuitDesignData(columns, rows, pinRows);
  field.value = new FieldGraph(data);
  updateDesignScore();
  resetVerificationResult();
  updateDimensions();
  if (clearHistory) {
    history.clear();
  }
};

const loadData = (data: CircuitDesignData, clearHistory = true) => {
  field.value = new FieldGraph(data);
  updateDesignScore();
  resetVerificationResult();
  updateDimensions();
  if (clearHistory) {
    history.clear();
  }
};

const load = (saveString: string, clearHistory = true) => {
  field.value = FieldGraph.from(saveString, 'circuit');
  updateDesignScore();
  resetVerificationResult();
  updateDimensions();
  if (clearHistory) {
    history.clear();
  }
};

const history = {
  states: [] as string[],
  position: 0,
  maxLength: 50,
  canUndo: ref(false),
  canRedo: ref(false),
  updatePermissions() {
    history.canUndo.value = history.position < history.states.length - 1;
    history.canRedo.value = history.position > 0;
  },
  push() {
    const data = field.value.toSaveString();
    // FIXME: a more performant way to check difference in state would be nice
    if (data === history.states[history.position]) return;
    if (history.position > 0) {
      history.states.splice(0, history.position);
      history.position = 0;
    }
    history.states.unshift(data);
    if (history.states.length > history.maxLength) {
      history.states.pop();
    }
    history.updatePermissions();
  },
  move(steps: number) {
    const newPosition = history.position + steps;
    if (newPosition < 0 || newPosition >= history.states.length) return;
    history.position = newPosition;
    const data = history.states[history.position];
    load(data, false);
    history.updatePermissions();
  },
  undo() {
    history.move(1);
  },
  redo() {
    history.move(-1);
  },
  clear() {
    history.states.splice(0, history.states.length);
    history.position = 0;
    history.push();
  },
};

history.clear();
updateDesignScore();
resetVerificationResult();
updateDimensions();

export default function useFieldGraph() {
  return {
    field,
    designScore: readonly(designScore),
    dimensions: readonly(dimensions),
    history,
    verificationResult: readonly(verificationResult),
    loadBlank,
    loadData,
    load,
    updateDesignScore,
    setVerificationResult,
    resetVerificationResult,
  };
}
