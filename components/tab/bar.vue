<template>
  <div
    class="flex flex-row flex-wrap justify-start items-stretch gap-[1px] min-h-8"
  >
    <TabBarItem
      v-for="item in items"
      :key="item.name"
      :item="item"
      :active="item.name === name"
      @click="onSelected(item)"
      @close="onClose(item)"
    >
      <template #before>
        <slot name="before" v-bind="item" />
      </template>
      <template #label>
        <slot name="label" v-bind="item" />
      </template>
      <template #after>
        <slot name="after" v-bind="item" />
      </template>
    </TabBarItem>
  </div>
</template>

<script setup lang="ts">
import type { TabBarItem } from '@/components/tab/bar-item.vue';

const name = defineModel<string>({ required: false });

const props = defineProps<{
  items: TabBarItem[];
}>();

const emit = defineEmits<{
  selected: [name: string, from?: string];
  close: [name: string];
}>();

function onSelected(item: TabBarItem) {
  if (item.disabled) return;
  emit('selected', item.name, name.value);
  name.value = item.name;
}

function onClose(item: TabBarItem) {
  emit('close', item.name);
}
</script>
