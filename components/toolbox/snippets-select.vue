<template>
  <div class="flex flex-col">
    <select multiple v-model="selected" class="flex-1">
      <optgroup v-for="snippet in groupsSorted" :label="snippet.label">
        <option v-for="option in snippet.options" :value="option" @dblclick="onSelect(option)">
          {{ option.name }}
        </option>
      </optgroup>
    </select>
    <div class="flex flex-row m-1 gap-1">
      <button class="flex-1" @click="onSave" :disabled="!selectionFieldGraph">Save</button>
      <button class="flex-1" @click="onLoad" :disabled="selected.length != 1">Load</button>
      <button class="flex-1" @click="onDelete" :disabled="!selected.length">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnippetRecord } from "@/composables/use-saved-snippets";
import { DesignData } from "@/serialization";
import { FieldGraph } from "@/simulation";

const fieldCanvas = ref();
const updateFieldCanvas = () => {
  fieldCanvas.value = document.getElementById('field-canvas');
  if (!fieldCanvas.value) {
    console.warn('Field canvas not found, retrying...');
    nextTick(updateFieldCanvas);
  }
}
updateFieldCanvas();

const TILE_SIZE = 13; // TODO: this needs to be shared with field.vue
const {
  elementX: canvasMouseX,
  elementY: canvasMouseY,
} = useMouseInElement(fieldCanvas);

const coordMouseX = computed(() => {
  return Math.floor(canvasMouseX.value / TILE_SIZE);
});
const coordMouseY = computed(() => {
  return Math.floor(canvasMouseY.value / TILE_SIZE);
});

const { groups, snippets, categories, saveSnippet, deleteSnippet } = useSavedSnippets();
const {
  start: startSelection,
  end: endSelection,
  translate: translateSelection,
  fieldGraph: selectionFieldGraph,
  state: selectionState,
  isSnippet: selectionIsSnippet,
  fieldView: selectionFieldView,
} = useSelection();
const { mode: toolboxMode } = useToolbox();
const selected = ref<SnippetRecord[]>([]);
const groupsSorted = computed(() => {
  const sorted = [...groups.value];
  sorted.sort((a, b) => a.label.localeCompare(b.label));
  return sorted;
});

const loadOption = async (opt: SnippetRecord) => {
  const field = FieldGraph.from(opt.data);
  const { columns, rows } = field.getDimensions();
  selectionFieldGraph.value = field;
  startSelection.value = [ 0, 0 ];
  endSelection.value = [ columns - 1, rows - 1 ];
  const viewX = Math.ceil(selectionFieldView.value[0] / TILE_SIZE) || 0;
  const viewY = Math.ceil(selectionFieldView.value[1] / TILE_SIZE) || 0;
  translateSelection.value = [
    coordMouseX.value + viewX - columns / 2,
    coordMouseY.value + viewY - rows / 2,
  ];
  selectionIsSnippet.value = true;
  selectionState.value = 'dragging';
  toolboxMode.value = 'select';
}

const onSelect = (opt: SnippetRecord) => {
  loadOption(opt);
}

const onSave = async () => {
  if (!selectionFieldGraph.value)
    return;
  const { columns, rows } = selectionFieldGraph.value.getDimensions();
  const data = selectionFieldGraph.value.toSaveString();
  const name = prompt("Enter a name for this snippet:");
  if (name) {
    console.log('Saving...', columns, rows, FieldGraph.from(data).getDimensions());
    await saveSnippet({
      name,
      data,
      width: columns,
      height: rows,
    });
  }
}

const onLoad = () => {
  const opt = selected.value[0];
  if (opt) {
    loadOption(opt);
  }
}

const onDelete = async () => {
  const opt = selected.value[0];
  if (opt?.id && confirm(`Are you sure you want to delete snippet "${opt.name}"?`)) {
    await deleteSnippet(opt.id);
  }
}

</script>
