<template>
  <Dialog :title btn-ok="Save" :disable-ok="!formData!.name" @ok="onSave">
    <slot name="before-form" />
    <form class="flex flex-col gap-2 w-[400px]">
      <slot name="prepend-form" />
      <label for="name">Name <span class="text-red-500">*</span></label>
      <input name="name" type="text" v-model="formData!.name" />
      <label for="category">Category</label>
      <input name="category" type="text" v-model="formData!.category" />
      <label for="description">Description</label>
      <textarea name="description" v-model="formData!.description" />
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
export interface SaveDesignFormData {
  name: string;
  category: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    data?: Partial<SaveDesignFormData>;
  }>(),
  {
    title: 'Design',
  },
);

const { data } = toRefs(props);

const emit = defineEmits<{
  save: [formData: SaveDesignFormData];
}>();

const { categories } = useSavedDesigns();

const formData = ref<SaveDesignFormData>();

watch(
  data,
  (newData) => {
    formData.value = {
      name: newData?.name || '',
      category: newData?.category || '',
      description: newData?.description || '',
    };
  },
  { immediate: true },
);

const onSave = () => {
  emit('save', formData.value!);
};
</script>
