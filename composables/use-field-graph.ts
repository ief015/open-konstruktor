import { DesignData, LayerDimensions } from "@/serialization";
import { FieldGraph } from "@/simulation";

const field = ref<FieldGraph>();
const designScore = ref(0);
const dimensions = reactive<LayerDimensions>({ columns: 0, rows: 0 });

const updateDesignScore = () => {
  designScore.value = field.value?.getDesignScore() ?? 0;
}

const updateDimensions = () => {
  if (!field.value) throw new Error("FieldGraph is not initialized");
  const { columns, rows } = field.value.getDimensions();
  dimensions.columns = columns;
  dimensions.rows = rows;
}

const loadBlank = (columns?: number, rows?: number, pinRows?: number) => {
  const data = new DesignData(columns, rows, pinRows);
  field.value = new FieldGraph(data);
  updateDesignScore();
  updateDimensions();
}

const load = (saveString: string) => {
  field.value = FieldGraph.from(saveString);
  updateDesignScore();
  updateDimensions();
}

loadBlank();

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