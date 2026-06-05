<!-- Homebrewed menu bar to get rid of existing external dependencies -->

<template>
  <div
    v-if="horizontal"
    @click="onClick"
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
      <div
        v-if="item === 'divider'"
        class="bg-neutral-700 h-full w-[1px] mx-1"
      />
      <MenuBarMenuItem
        v-else
        :ref="(ref) => (itemRefs[idx] = ref)"
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
    @click="onClick"
    class="flex flex-col py-2 min-w-32 max-w-80 w-max rounded shadow"
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
      <MenuBarMenuItem
        v-else
        class="py-2"
        :ref="(ref) => (itemRefs[idx] = ref)"
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
  selected: [id: string];
}>();

const itemRefs = ref<any>([]);

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

function onSelected(id: string) {
  closeAllMenus();
  emits('selected', id);
}

function onClick(event: MouseEvent) {
  if (props._root) {
    event.stopPropagation();
  }
}

if (props._root) {
  useEventListener('click', (event) => {
    closeAllMenus();
  });
}
</script>
