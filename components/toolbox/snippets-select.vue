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
    <button class="flex-1" @click="onSave" :disabled="!selectionData">Save</button>
    <button class="flex-1" @click="onLoad" :disabled="selected.length != 1">Load</button>
    <button class="flex-1" @click="onDelete" :disabled="!selected.length">Delete</button>
  </div>
</div>
</template>

<script setup lang="ts">
import { SnippetRecord } from "@/composables/use-saved-snippets";
import { DesignData } from "@/serialization";
import { FieldGraph } from "@/simulation";

const { groups, snippets, categories, saveSnippet, deleteSnippet } = useSavedSnippets();
const {
  start: startSelection,
  end: endSelection,
  translate: translateSelection,
  data: selectionData,
  state: selectionState,
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
  console.log(field);
  selectionData.value = field;
  startSelection.value = [ 0, 0 ];
  endSelection.value = [ columns - 1, rows - 1 ];
  translateSelection.value = [ 0, 0 ];
  selectionState.value = 'dragging';
  toolboxMode.value = 'select';
}

const onSelect = (opt: SnippetRecord) => {
  loadOption(opt);
}

const onSave = async () => {
  if (!selectionData.value)
    return;
  const { columns, rows } = selectionData.value.getDimensions();
  const data = selectionData.value.toSaveString();
  console.log(columns, rows, FieldGraph.from(data).getDimensions());
  const name = prompt("Enter a name for this snippet:");
  if (name) {
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
  if (opt?.id && confirm(`Are you sure you want to delete "${opt.name}"?`)) {
    await deleteSnippet(opt.id);
  }
}

</script>
