<template>
  <div class="flex flex-col">
    <select multiple v-model="selected" class="flex-1">
      <optgroup v-for="group in groupsSorted" :label="group.label">
        <option v-for="option in group.options" :value="option" @dblclick="onSelect(option)">
          {{ option.name }}
        </option>
      </optgroup>
    </select>
    <div class="flex flex-row m-1 gap-1">
      <button class="flex-1" @click="onSave">Save</button>
      <button class="flex-1" @click="onLoad" :disabled="selected.length != 1">Load</button>
      <button class="flex-1" @click="onDelete" :disabled="!selected.length">Delete</button>
    </div>
    <DialogSnippetsSave v-model="showSaveDialog" @save="onSaveSubmit" />
  </div>
</template>

<script setup lang="ts">
import type { SaveDesignFormData } from "@/components/dialog/designs/save.vue";
import type { DesignRecord } from "@/composables/use-saved-designs";

const { groups, designs, categories, saveDesign, deleteDesign } = useSavedDesigns();
const { load: loadField, field } = useFieldGraph();
const { load: loadSim } = useCircuitSimulator();

const selected = ref<DesignRecord[]>([]);

const groupsSorted = computed(() => {
  const sorted = [...groups.value];
  sorted.sort((a, b) => a.label.localeCompare(b.label));
  return sorted;
});

const showSaveDialog = ref(false);

const loadOption = (opt: DesignRecord) => {
  loadField(opt.data);
  loadSim(field.value);
}

const confirmLoad = (opt: DesignRecord) => {
  if (confirm(`Are you sure you want to load "${opt.name}"?`)) {
    loadOption(opt);
  }
}

const onSelect = (opt: DesignRecord) => {
  confirmLoad(opt);
}

const onSave = () => {
  if (!field.value)
    return;
  showSaveDialog.value = true;
}

const onSaveSubmit = async (formData: SaveDesignFormData) => {
  if (!field.value)
    return;
  const { columns, rows } = field.value.getDimensions();
  const data = field.value.toSaveString();
  await saveDesign({
    name: formData.name,
    category: formData.category,
    description: formData.description,
    data,
    width: columns,
    height: rows,
  });
}

const onLoad = () => {
  const opt = selected.value[0];
  if (opt) {
    confirmLoad(opt);
  }
}

const onDelete = async () => {
  const opt = selected.value[0];
  if (opt?.id && confirm(`Are you sure you want to delete "${opt.name}"?`)) {
    await deleteDesign(opt.id);
  }
}

</script>