<template>
  <div
    class="flex flex-row items-center justify-center h-8 px-2 text-sm text-gray-700 dark:text-gray-300"
    :class="{
      'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700':
        !props.item.disabled,
      'opacity-50 cursor-not-allowed': props.item.disabled,
      'bg-gray-200 dark:bg-gray-700': props.active,
    }"
  >
    <slot name="before" />
    <slot name="label">
      <span class="select-none" @dblclick="emit('labelDblClick')">{{
        props.item.label
      }}</span>
    </slot>
    <slot name="close">
      <span
        v-if="props.item.closeable"
        class="ml-2 cursor-pointer hover:text-gray-100 select-none"
        @click.stop="emit('close')"
      >
        🗙
      </span>
    </slot>
    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
export type TabBarItem = {
  name: string;
  label: string;
  icon?: string;
  closeable?: boolean;
  disabled?: boolean;
};

const props = defineProps<{
  item: TabBarItem;
  active?: boolean;
}>();

const emit = defineEmits<{
  labelDblClick: [];
  close: [];
}>();
</script>
