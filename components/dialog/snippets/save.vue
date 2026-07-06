<template>
  <Dialog :title btn-ok="Save" :disable-ok="!formData!.name" @ok="onSave">
    <slot name="before-form" />
    <form class="flex flex-col gap-2 w-[400px]" @submit.prevent="onSave">
      <slot name="prepend-form" />
      <label for="name">Name <span class="text-red-500">*</span></label>
      <input name="name" type="text" v-model="formData!.name" />
      <label for="category">Category</label>
      <input name="category" type="text" v-model="formData!.category" />
      <label for="description">Description</label>
      <textarea
        name="description"
        v-model="formData!.description"
        style="resize: vertical"
        class="h-[10em]"
      />
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
export interface SaveSnippetFormData {
  name: string;
  category: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    data?: Partial<SaveSnippetFormData>;
  }>(),
  {
    title: 'Snippet',
  },
);

const { data } = toRefs(props);

const emit = defineEmits<{
  save: [formData: SaveSnippetFormData];
}>();

const { categories } = useSavedSnippets();

const formData = ref<SaveSnippetFormData>();

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

function onSave() {
  emit('save', formData.value!);
}
</script>
