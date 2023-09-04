import { DesignData, LayerDimensions } from "@/serialization";
import { FieldGraph } from "@/simulation";

let field: FieldGraph = new FieldGraph();
const fieldRef = ref<FieldGraph>(field);
const designScore = ref(0);
const dimensions = reactive<LayerDimensions>({ columns: 0, rows: 0 });

const updateDesignScore = () => {
  designScore.value = field.getDesignScore();
}

const updateDimensions = () => {
  const { columns, rows } = field.getDimensions();
  dimensions.columns = columns;
  dimensions.rows = rows;
}

const loadBlank = (columns?: number, rows?: number, pinRows?: number) => {
  const data = new DesignData(columns, rows, pinRows);
  field = new FieldGraph(data);
  fieldRef.value = field;
  updateDesignScore();
  updateDimensions();
  return field;
}

const load = (saveString: string) => {
  field = FieldGraph.from(saveString)
  fieldRef.value = field;
  updateDesignScore();
  updateDimensions();
  return field;
}

updateDesignScore();
updateDimensions();

export default function useFieldGraph() {
  return {
    fieldRef,
    designScore: readonly(designScore),
    dimensions: readonly(dimensions),
    loadBlank,
    load,
    updateDesignScore,
    getField: () => field,
  };
}