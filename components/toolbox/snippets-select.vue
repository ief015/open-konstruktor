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

const { groups, snippets, categories, saveSnippet, deleteSnippet } = useSavedSnippets();
const {
  data: selectionData,
} = useSelection();
const selected = ref<SnippetRecord[]>([]);
const groupsSorted = computed(() => {
  const sorted = [...groups.value];
  sorted.sort((a, b) => a.label.localeCompare(b.label));
  return sorted;
});

const loadOption = (opt: SnippetRecord) => {
  alert("Not yet implemented");
}

const onSelect = (opt: SnippetRecord) => {
  loadOption(opt);
}

const onSave = async () => {
  if (!selectionData.value)
    return;
  const data = selectionData.value.toSaveString();
  const name = prompt("Enter a name for this snippet:");
  if (name) {
    await saveSnippet({
      name,
      data,
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
