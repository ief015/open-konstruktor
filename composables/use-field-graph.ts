import { CircuitDesignData } from "@/serialization";
import type { LayerDimensions } from "@/serialization";
import { FieldGraph } from "@/simulation";

const field = shallowRef<FieldGraph>(new FieldGraph());
const designScore = ref(0);
const dimensions = reactive<LayerDimensions>({ columns: 0, rows: 0 });

const updateDesignScore = () => {
  designScore.value = field.value.getDesignScore();
}

const updateDimensions = () => {
  const { columns, rows } = field.value.getDimensions();
  dimensions.columns = columns;
  dimensions.rows = rows;
}

const loadBlank = (columns?: number, rows?: number, pinRows?: number) => {
  const data = new CircuitDesignData(columns, rows, pinRows);
  field.value = new FieldGraph(data);
  updateDesignScore();
  updateDimensions();
}

const load = (saveString: string) => {
  field.value = FieldGraph.from(saveString, 'circuit');
  updateDesignScore();
  updateDimensions();
}

updateDesignScore();
updateDimensions();

export default function useFieldGraph() {
  return {
    field,
    designScore: readonly(designScore),
    dimensions: readonly(dimensions),
    loadBlank,
    load,
    updateDesignScore,
  };
}