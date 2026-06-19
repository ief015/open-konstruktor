<template>
  <Dialog :title btn-ok="Apply" :disable-ok="!model?.label" @ok="onSave">
    <slot name="before-form" />
    <form
      class="flex flex-col gap-2 w-[400px]"
      v-if="model"
      @submit.prevent="onSave"
    >
      <slot name="prepend-form" />
      <label>Label</label>
      <input type="text" maxlength="30" v-model="formData.label" />
      <slot name="append-form" />
    </form>
    <slot name="after-form" />
    <template #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <template #append-actions>
      <slot name="append-actions" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { ProbeInfo } from '@/simulation/CircuitSimulation';

const model = defineModel<ProbeInfo>('probe');
const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: 'Label Probe',
  },
);

const formData = reactive({
  label: '',
});

watch(
  model,
  (newVal) => {
    if (newVal) {
      formData.label = newVal.label;
    }
  },
  { immediate: true },
);

const emit = defineEmits<{
  save: [label: string];
}>();

function onSave() {
  if (!model.value) return;
  model.value.label = formData.label;
  emit('save', model.value.label);
}
</script>
