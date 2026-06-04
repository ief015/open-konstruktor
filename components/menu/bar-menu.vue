<!-- Menu that lists items vertically -->

<template>
  <div
    class="flex flex-col py-2 text-nowrap min-w-32 max-w-80 rounded shadow"
    :style="{
      'background-color': theme.background,
      color: theme.foreground,
    }"
  >
    <template
      v-for="(item, idx) in items"
      :key="item === 'divider' ? `divider-${idx}` : item.id"
    >
      <div
        v-if="item === 'divider'"
        class="w-full h-[1px] bg-neutral-700 my-1"
      />
      <BarMenuItem
        v-else
        class="py-2"
        :ref="
          (ref) => (itemRefs[idx] = ref as InstanceType<typeof BarMenuItem>)
        "
        :id="item.id"
        :label="item.label"
        :items="item.items"
        :theme
        menu-direction="right"
        @selected="onSelected"
        @menu-opened="onMenuOpened(itemRefs[idx])"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import BarMenuItem from '@/components/menu/bar-menu-item.vue';
import type { MenuBarItem, MenuBarTheme } from '@/components/menu/bar2.vue';

const itemRefs = ref<InstanceType<typeof BarMenuItem>[]>([]);

const props = defineProps<{
  items: MenuBarItem[];
  theme: MenuBarTheme;
}>();

const emits = defineEmits<{
  selected: [id: string];
}>();

function onSelected(id: string) {
  emits('selected', id);
}

function onMenuOpened(item: InstanceType<typeof BarMenuItem>) {
  for (const ref of itemRefs.value) {
    if (ref && ref !== item) {
      ref.closeMenu();
    }
  }
}
</script>
