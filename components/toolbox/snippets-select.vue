<template>
  <div class="flex flex-col">
    <select multiple v-model="selected" class="flex-1">
      <optgroup
        v-for="group in groupsSorted"
        :label="group.label"
        :title="group.label"
      >
        <option
          v-for="snippet in group.options"
          :value="snippet"
          @dblclick="onSelect(snippet)"
          :title="snippet.description"
        >
          {{ snippet.name }}
        </option>
      </optgroup>
    </select>
    <div class="flex flex-row m-1 gap-1">
      <button
        class="flex-1 text-xs"
        @click="onSave"
        :disabled="!selectionFieldGraph"
      >
        Save
      </button>
      <button
        class="flex-1 text-xs"
        @click="onLoad"
        :disabled="selected.length != 1"
      >
        Load
      </button>
      <button
        class="flex-1 text-xs"
        @click="onEdit"
        :disabled="!selected.length"
      >
        Edit
      </button>
    </div>
    <DialogSnippetsSave
      v-model="showSaveDialog"
      :data="showSaveDialogInit"
      @save="onSaveSubmit"
      :title="`${showSaveDialogID ? 'Edit' : 'New'} Snippet`"
    >
      <template #append-form>
        <div v-if="showSaveDialogID" class="text-xs opacity-50">
          ID: {{ showSaveDialogID }}
        </div>
      </template>
      <template #prepend-actions>
        <button
          v-if="showSaveDialogID"
          class="text-xs mr-auto"
          @click="onDelete"
        >
          Delete
        </button>
      </template>
    </DialogSnippetsSave>
  </div>
</template>

<script setup lang="ts">
import type { SaveSnippetFormData } from '@/components/dialog/snippets/save.vue';
import type { SnippetRecord } from '@/composables/use-saved-snippets';
import { FieldGraph } from '@/simulation';

const fieldCanvas = ref();
const updateFieldCanvas = () => {
  fieldCanvas.value = document.getElementById('field-canvas');
  if (!fieldCanvas.value) {
    console.warn('Field canvas not found, retrying...');
    nextTick(updateFieldCanvas);
  }
};
updateFieldCanvas();

const TILE_SIZE = 13; // TODO: this needs to be shared with field.vue
const { elementX: canvasMouseX, elementY: canvasMouseY } =
  useMouseInElement(fieldCanvas);

const coordMouseX = computed(() => {
  return Math.floor(canvasMouseX.value / TILE_SIZE);
});
const coordMouseY = computed(() => {
  return Math.floor(canvasMouseY.value / TILE_SIZE);
});

const showSaveDialog = ref(false);
const showSaveDialogID = ref<SnippetRecord['id']>();
const showSaveDialogInit = ref<SaveSnippetFormData>();

const { groups, snippets, categories, saveSnippet, deleteSnippet } =
  useSavedSnippets();
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
  const field = FieldGraph.from(opt.data, 'snippet');
  const { columns, rows } = field.getDimensions();
  selectionFieldGraph.value = field;
  startSelection.value = [0, 0];
  endSelection.value = [columns - 1, rows - 1];
  const viewX = Math.ceil(selectionFieldView.value[0] / TILE_SIZE) || 0;
  const viewY = Math.ceil(selectionFieldView.value[1] / TILE_SIZE) || 0;
  translateSelection.value = [
    coordMouseX.value + viewX - columns / 2,
    coordMouseY.value + viewY - rows / 2,
  ];
  selectionIsSnippet.value = true;
  selectionState.value = 'dragging';
  toolboxMode.value = 'select';
};

const onSelect = (opt: SnippetRecord) => {
  loadOption(opt);
};

const onSave = () => {
  if (!selectionFieldGraph.value) return;
  showSaveDialogInit.value = undefined;
  showSaveDialogID.value = undefined;
  showSaveDialog.value = true;
};

const onSaveSubmit = async (formData: SaveSnippetFormData) => {
  if (!selectionFieldGraph.value) return;
  const { columns, rows } = selectionFieldGraph.value.getDimensions();
  const data = selectionFieldGraph.value.toSaveString();
  await saveSnippet({
    id: showSaveDialogID.value,
    name: formData.name,
    category: formData.category,
    description: formData.description,
    data,
    width: columns,
    height: rows,
  });
};

const onLoad = () => {
  const opt = selected.value[0];
  if (opt) {
    loadOption(opt);
  }
};

const onEdit = () => {
  const opt = selected.value[0];
  if (opt) {
    showSaveDialogID.value = opt.id;
    showSaveDialogInit.value = {
      name: opt.name,
      category: opt.category,
      description: opt.description || '',
    };
    showSaveDialog.value = true;
  }
};

const onDelete = async () => {
  const opt = selected.value[0];
  if (
    opt?.id &&
    confirm(`Are you sure you want to delete snippet "${opt.name}"?`)
  ) {
    await deleteSnippet(opt.id);
    selected.value = [];
    showSaveDialog.value = false;
  }
};
</script>
