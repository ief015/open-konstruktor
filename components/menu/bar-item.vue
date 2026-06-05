<template>
  <div
    @click.stop="onClick"
    class="relative flex flex-row gap-2 items-center px-2 cursor-pointer"
    :style="{
      'background-color': isOpen ? theme.backgroundHover : theme.background,
      color: isOpen ? theme.foregroundHover : theme.foreground,
    }"
    @mouseenter="hoverItem = true"
    @mouseleave="hoverItem = false"
  >
    <slot name="icon"> </slot>
    <slot name="label"> {{ label ?? '' }} </slot>
    <div
      v-if="items && items.length && props.menuDirection === 'right'"
      class="ml-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </div>
    <MenuBar
      v-if="items && items.length && isOpen"
      :class="`absolute z-10 ${props.menuDirection === 'down' ? 'top-full left-0' : '-top-2 left-full'}`"
      :items="items"
      :theme
      :_root="false"
      @selected="onSelected"
      @mouseenter="hoverMenu = true"
      @mouseleave="hoverMenu = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuBarItem, MenuBarTheme } from '@/components/menu/bar.vue';

const props = defineProps<{
  id?: string;
  label?: string;
  items?: MenuBarItem[];
  theme: MenuBarTheme;
  menuDirection: 'down' | 'right';
}>();

const emits = defineEmits<{
  selected: [id?: string, _keepOpen?: boolean];
  menuOpened: [];
  menuClosed: [];
}>();

const hoverItem = ref(false);
const hoverMenu = ref(false);
const forceOpened = ref(false);

const isOpen = computed({
  get() {
    return hoverItem.value || hoverMenu.value || forceOpened.value;
  },
  set(value: boolean) {
    hoverItem.value = value;
    hoverMenu.value = value;
    forceOpened.value = value;
  },
});

function onSelected(id?: string, _keepOpen?: boolean) {
  if (_keepOpen) {
    forceOpened.value = true;
  } else {
    isOpen.value = false;
  }
  emits('selected', id, _keepOpen);
}

function onClick() {
  const keepOpen = props.items && props.items.length > 0;
  onSelected(props.id, keepOpen);
}

watch(isOpen, (newVal) => {
  if (newVal) {
    emits('menuOpened');
  } else {
    emits('menuClosed');
  }
});

defineExpose({
  id: computed(() => props.id),
  openMenu() {
    if (props.items && props.items.length > 0) {
      onSelected(props.id, true);
    }
  },
  closeMenu() {
    isOpen.value = false;
  },
});
</script>
