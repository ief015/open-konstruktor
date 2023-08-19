import { FieldGraph } from "@/simulation";

const field = ref<FieldGraph>();

const loadBlank = () => {
  field.value = new FieldGraph();
}

const load = (saveString: string) => {
  field.value = FieldGraph.from(saveString);
}

loadBlank();

export default function useFieldGraph() {
  return {
    field,
    loadBlank,
    load,
  };
}