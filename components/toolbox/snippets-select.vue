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
          :title="getTooltip(snippet)"
        >
          {{ snippet.name }}
        </option>
      </optgroup>
    </select>
    <div class="flex flex-row m-1 gap-1">
      <button
        class="flex-1 p-0"
        @click="onSave"
        :disabled="!selectionFieldGraph"
      >
        Save
      </button>
      <button
        class="flex-1 p-0"
        @click="onLoad"
        :disabled="selected.length != 1"
      >
        Load
      </button>
      <button class="flex-1 p-0" @click="onEdit" :disabled="!selected.length">
        Edit
      </button>
    </div>
    <DialogSnippetsSave
      v-model="saveDialog.isOpen"
      :data="saveDialog.init"
      @save="onSaveSubmit"
      :title="`${saveDialog.record ? 'Edit' : 'New'} Snippet`"
    >
      <template #append-form>
        <div v-if="saveDialog.record" class="text-xs opacity-50">
          <div>ID: {{ saveDialog.record.id }}</div>
          <div>
            Created:
            {{ new Date(saveDialog.record.createdAt ?? '').toLocaleString() }}
          </div>
          <div>
            Updated:
            {{ new Date(saveDialog.record.updatedAt ?? '').toLocaleString() }}
          </div>
        </div>
      </template>
      <template #prepend-actions>
        <button v-if="saveDialog.record" class="mr-auto" @click="onDelete">
          Delete
        </button>
        <div
          v-if="!saveDialog.record"
          title="Fit dimensions to the snippet's content by trimming any excess space around it"
        >
          <input
            id="snippets-select-bTrim"
            name="bTrim"
            type="checkbox"
            v-model="saveDialog.trim"
          />
          <label for="snippets-select-bTrim" class="text-sm mr-1">
            Trim empty space
          </label>
        </div>
      </template>
    </DialogSnippetsSave>
  </div>
</template>

<script setup lang="ts">
import type { SaveSnippetFormData } from '@/components/dialog/snippets/save.vue';
import type { SnippetRecord } from '@/composables/use-saved-snippets';
import { DesignData } from '@/serialization';
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

const saveDialog = reactive({
  isOpen: false,
  record: null as SnippetRecord | null,
  init: undefined as SaveSnippetFormData | undefined,
  trim: true,
  open(record: SnippetRecord | null = null) {
    this.record = record;
    this.init = {
      name: record?.name || '',
      category: record?.category || '',
      description: record?.description || '',
    };
    this.trim = !record; // default true for new snippets
    this.isOpen = true;
  },
  close() {
    this.isOpen = false;
  },
});

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

function getTooltip(snippet: SnippetRecord) {
  const { name, description } = snippet;
  if (description) {
    return `${name}\n${description}`;
  }
  return name;
}

const onSelect = (opt: SnippetRecord) => {
  loadOption(opt);
};

const onSave = () => {
  if (!selectionFieldGraph.value) return;
  if (selectionFieldGraph.value.isEmpty()) return;
  saveDialog.open();
};

const onSaveSubmit = async (formData: SaveSnippetFormData) => {
  if (!selectionFieldGraph.value) return;
  const field =
    saveDialog.trim && !saveDialog.record
      ? new FieldGraph(selectionFieldGraph.value.getData().trim())
      : selectionFieldGraph.value;
  const { columns, rows } = saveDialog.record
    ? { columns: saveDialog.record.width, rows: saveDialog.record.height }
    : field.getDimensions();
  await saveSnippet({
    id: saveDialog.record?.id,
    name: formData.name,
    category: formData.category,
    description: formData.description,
    data: saveDialog.record?.data ?? field.toSaveString(),
    width: columns,
    height: rows,
    createdAt: saveDialog.record?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    saveDialog.open(opt);
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
    saveDialog.close();
  }
};
</script>
