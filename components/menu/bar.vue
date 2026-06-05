<template>
  <div
    v-if="horizontal"
    class="flex flex-row items-center px-2 select-none overflow-visible"
    :style="{
      'background-color': theme.background,
      color: theme.foreground,
    }"
  >
    <template
      v-for="(item, idx) in items"
      :key="item === 'divider' ? `divider-${idx}` : item.id"
    >
      <div v-if="item === 'divider'" class="bg-[#666] h-full w-[1px] mx-1" />
      <MenuBarItem
        v-else
        :ref="(ref) => assignRef(idx, ref)"
        :id="item.id"
        :label="item.label"
        :items="item.items"
        :theme
        menu-direction="down"
        @selected="onSelected"
        @menu-opened="onMenuOpened(idx)"
      />
    </template>
  </div>
  <div
    v-else
    class="flex flex-col py-2 min-w-32 max-w-80 w-max shadow border rounded border-solid border-black"
    :style="{
      'background-color': theme.background,
      color: theme.foreground,
    }"
  >
    <template
      v-for="(item, idx) in items"
      :key="item === 'divider' ? `divider-${idx}` : item.id"
    >
      <div v-if="item === 'divider'" class="w-full h-[1px] bg-[#666] my-1" />
      <MenuBarItem
        v-else
        class="py-2"
        :ref="(ref) => assignRef(idx, ref)"
        :id="item.id"
        :label="item.label"
        :items="item.items"
        :theme
        menu-direction="right"
        @selected="onSelected"
        @menu-opened="onMenuOpened(idx)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type BarMenuItem from '@/components/menu/bar-item.vue';
import type { ComponentPublicInstance } from 'vue';

export type MenuBarItem =
  | {
      id?: string;
      label?: string;
      items?: MenuBarItem[];
    }
  | 'divider';

export type MenuBarTheme = {
  background: string;
  foreground: string;
  backgroundHover: string;
  foregroundHover: string;
};

const props = withDefaults(
  defineProps<{
    items?: MenuBarItem[];
    theme?: MenuBarTheme;
    horizontal?: boolean;
    _root?: boolean;
  }>(),
  {
    _root: true,
    items: () => [],
    theme: () => ({
      background: '#242424',
      foreground: '#eee',
      backgroundHover: '#444',
      foregroundHover: '#e8e8e8',
    }),
  },
);

const emits = defineEmits<{
  selected: [id?: string, _keepOpen?: boolean];
}>();

const itemRefs = ref<InstanceType<typeof BarMenuItem>[]>([]);

function assignRef(
  index: number,
  ref: ComponentPublicInstance | Element | null,
) {
  if (ref === null) return;
  itemRefs.value[index] = ref as InstanceType<typeof BarMenuItem>;
}

function closeAllMenus() {
  for (const ref of itemRefs.value) {
    ref?.closeMenu();
  }
}

function onMenuOpened(itemIdx: number) {
  for (const ref of itemRefs.value) {
    if (ref && ref !== itemRefs.value[itemIdx]) {
      ref.closeMenu();
    }
  }
}

function onSelected(id?: string, _keepOpen?: boolean) {
  if (!_keepOpen) closeAllMenus();
  emits('selected', id, _keepOpen);
}

if (props._root) {
  useEventListener('click', (event) => {
    closeAllMenus();
  });
}

defineExpose({
  openMenu(id: string) {
    const item = itemRefs.value.find((ref) => ref.id === id);
    if (item) {
      item.openMenu();
    }
  },
  closeAllMenus,
});
</script>
