import { DesignData, LayerDimensions } from "@/serialization";
import { FieldGraph } from "@/simulation";

const field = ref<FieldGraph>();
const designScore = ref(0);

const updateDesignScore = () => {
  designScore.value = field.value?.getDesignScore() ?? 0;
}

const loadBlank = (columns?: number, rows?: number, pinRows?: number) => {
  const data = new DesignData(columns, rows, pinRows);
  field.value = new FieldGraph(data);
  updateDesignScore();
}

const load = (saveString: string) => {
  field.value = FieldGraph.from(saveString);
  updateDesignScore();
}

loadBlank();

export default function useFieldGraph() {
  return {
    field,
    designScore: readonly(designScore),
    loadBlank,
    load,
    updateDesignScore,
  };
}