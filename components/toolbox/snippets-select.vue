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
import { FieldGraph } from '@/simulation';

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
  computeTranslationFromMouse,
} = useSelection();
const { mode: toolboxMode } = useToolbox();
const selected = ref<SnippetRecord[]>([]);
const groupsSorted = computed(() => {
  const sorted = [...groups.value];
  sorted.sort((a, b) => a.label.localeCompare(b.label));
  return sorted;
});

async function loadOption(opt: SnippetRecord) {
  const field = FieldGraph.from(opt.data, 'snippet');
  const { columns, rows } = field.getDimensions();
  selectionFieldGraph.value = field;
  startSelection.value = [0, 0];
  endSelection.value = [columns - 1, rows - 1];
  translateSelection.value = computeTranslationFromMouse();
  selectionIsSnippet.value = true;
  selectionState.value = 'dragging';
  toolboxMode.value = 'select';
}

function getTooltip(snippet: SnippetRecord) {
  const { name, description } = snippet;
  if (description) {
    return `${name}\n${description}`;
  }
  return name;
}

function onSelect(opt: SnippetRecord) {
  loadOption(opt);
}

function onSave() {
  if (!selectionFieldGraph.value) return;
  if (selectionFieldGraph.value.isEmpty()) return;
  saveDialog.open();
}

async function onSaveSubmit(formData: SaveSnippetFormData) {
  if (saveDialog.record) {
    // Save existing snippet
    await saveSnippet({
      ...saveDialog.record,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Save new snippet
    if (!selectionFieldGraph.value) throw new Error('No selection to save');
    const field = saveDialog.trim
      ? new FieldGraph(selectionFieldGraph.value.getData().trim())
      : selectionFieldGraph.value;
    const { columns, rows } = field.getDimensions();
    const now = new Date().toISOString();
    await saveSnippet({
      name: formData.name,
      category: formData.category,
      description: formData.description,
      data: field.toSaveString(),
      width: columns,
      height: rows,
      createdAt: now,
      updatedAt: now,
    });
  }
}

function onLoad() {
  const opt = selected.value[0];
  if (opt) {
    loadOption(opt);
  }
}

function onEdit() {
  const opt = selected.value[0];
  if (opt) {
    saveDialog.open(opt);
  }
}

async function onDelete() {
  const opt = selected.value[0];
  if (
    opt?.id &&
    confirm(`Are you sure you want to delete snippet "${opt.name}"?`)
  ) {
    await deleteSnippet(opt.id);
    selected.value = [];
    saveDialog.close();
  }
}
</script>
