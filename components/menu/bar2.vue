<!-- Homebrewed menu bar to get rid of existing external dependencies -->

<template>
  <div
    v-if="horizontal"
    @click.stop
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
      <BarMenuItem
        v-else
        :ref="
          (ref) => (itemRefs[idx] = ref as InstanceType<typeof BarMenuItem>)
        "
        :id="item.id"
        :label="item.label"
        :items="item.items"
        :theme
        menu-direction="down"
        @selected="onSelected"
        @menu-opened="onMenuOpened(itemRefs[idx])"
      />
    </template>
  </div>
  <div
    v-else
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
  }>(),
  {
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

function onSelected(id: string) {
  emits('selected', id);
}

const itemRefs = ref<InstanceType<typeof BarMenuItem>[]>([]);

function onMenuOpened(item: InstanceType<typeof BarMenuItem>) {
  for (const ref of itemRefs.value) {
    if (ref && ref !== item) {
      ref.closeMenu();
    }
  }
}

useEventListener('click', (event) => {
  for (const ref of itemRefs.value) {
    if (ref) {
      ref.closeMenu();
    }
  }
});
</script>
