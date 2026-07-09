<template>
  <div class="flex flex-col">
    <select multiple v-model="selected" class="flex-1">
      <optgroup
        v-for="group in groupsSorted"
        :label="group.label"
        :title="group.label"
      >
        <option
          v-for="design in group.options"
          :value="design"
          @dblclick="onSelect(design)"
          :title="getTooltip(design)"
        >
          {{ design.name }}
        </option>
      </optgroup>
    </select>
    <div class="flex flex-row m-1 items-center gap-1">
      <button class="flex-1 p-0" @click="onSave">
        <span>Save</span>
      </button>
      <button
        class="flex-1 p-0"
        @click="onLoad"
        :disabled="selected.length != 1"
      >
        Load
      </button>
      <button
        class="flex-1 p-0"
        @click="onEdit"
        :disabled="selected.length != 1"
      >
        Edit
      </button>
    </div>
    <DialogDesignsSave
      v-model="saveDialog.isOpen"
      :data="saveDialog.init"
      @save="onSaveSubmit"
      :title="`${saveDialog.record ? 'Edit' : 'New'} Design`"
    >
      <template #append-form>
        <div v-if="saveDialog.record" class="text-xs opacity-50">
          <div>ID: {{ saveDialog.record.id }}</div>
          <div>
            Created:
            {{ new Date(saveDialog.record.createdAt).toLocaleString() }}
          </div>
          <div>
            Updated:
            {{ new Date(saveDialog.record.updatedAt).toLocaleString() }}
          </div>
        </div>
      </template>
      <template #prepend-actions>
        <button v-if="saveDialog.record" class="mr-auto" @click="onDelete">
          Delete
        </button>
      </template>
    </DialogDesignsSave>
  </div>
</template>

<script setup lang="ts">
import type { SaveDesignFormData } from '@/components/dialog/designs/save.vue';

const { groups, designs, categories, saveDesign, deleteDesign } =
  useSavedDesigns();
const circuitSimulation = injectCircuitSimulation();
const {
  name: simName,
  load: loadSim,
  circuitFactory,
  field: fieldGraph,
} = toShallowRefs(circuitSimulation);
const {
  field,
  load: loadField,
  verificationResult,
  designScore,
} = toShallowRefs(fieldGraph);

const selected = ref<DesignRecord[]>([]);

const groupsSorted = computed(() => {
  const sorted = [...groups.value];
  sorted.sort((a, b) => a.label.localeCompare(b.label));
  return sorted;
});

function getAutoName() {
  const grade = verificationResult.value
    ? `${verificationResult.value.gradePercent}%`
    : 'Unverified';
  const date = new Date().toLocaleString();
  return `${grade} (${designScore.value}) - ${date}`;
}

function getTooltip(design: DesignRecord) {
  const { name, description } = design;
  if (description) {
    return `${name}\n${description}`;
  }
  return name;
}

const saveDialog = reactive({
  isOpen: false,
  record: null as DesignRecord | null,
  init: undefined as SaveDesignFormData | undefined,
  open(record: DesignRecord | null = null) {
    this.record = record;
    this.init = {
      name: record?.name || getAutoName(),
      category: record?.category || circuitFactory.value?.label || '',
      description: record?.description || '',
    };
    this.isOpen = true;
  },
  close() {
    this.isOpen = false;
  },
});

function loadOption(opt: DesignRecord) {
  loadField.value(opt.data);
  loadSim.value();
  simName.value = opt.name;
}

function confirmLoad(opt: DesignRecord) {
  if (confirm(`Are you sure you want to load "${opt.name}"?`)) {
    loadOption(opt);
  }
}

function onSelect(opt: DesignRecord) {
  confirmLoad(opt);
}

function onSave() {
  if (!field.value) return;
  saveDialog.open();
}

async function onSaveSubmit(formData: SaveDesignFormData) {
  if (!field.value) return;
  const { columns, rows } = saveDialog.record
    ? { columns: saveDialog.record.width, rows: saveDialog.record.height }
    : field.value.getDimensions();
  await saveDesign({
    id: saveDialog.record?.id,
    name: formData.name,
    category: formData.category,
    description: formData.description,
    data: saveDialog.record?.data ?? field.value.toSaveString(),
    width: columns,
    height: rows,
    createdAt: saveDialog.record?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function onLoad() {
  const opt = selected.value[0];
  if (opt) {
    confirmLoad(opt);
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
  if (opt?.id && confirm(`Are you sure you want to delete "${opt.name}"?`)) {
    await deleteDesign(opt.id);
    selected.value = [];
    saveDialog.close();
  }
}
</script>
