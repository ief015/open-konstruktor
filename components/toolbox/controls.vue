<template>
  <div
    class="flex items-center gap-2 p-2"
    :class="{ 'flex-row': props.horizontal, 'flex-col': !props.horizontal }"
  >
    <div v-for="item in toolkit" class="w-full">
      <button
        @click="onClickTool(item)"
        class="flex items-center justify-center w-full h-[3em] rounded border-solid border-2"
        :class="{
          [item.classes ?? '']: true,
          'border-white': item.mode === mode,
          'border-neutral-600': item.mode !== mode,
          'hover:border-neutral-300': item.mode !== mode,
        }"
      >
        <img
          v-if="item.icon"
          :src="item.icon"
          class="w-[12px] h-[12px]"
        />
        <span>{{ item.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ToolboxMode } from '@/composables/use-toolbox';

interface ToolkitItem {
  name: string
  icon?: string
  mode: ToolboxMode
  classes?: string
  labelClass?: string
}

const props = withDefaults(defineProps<{
  horizontal?: boolean
}>(), {
  horizontal: false
});

const emit = defineEmits<{
  'change': [ mode: ToolboxMode, prevMode: ToolboxMode ]
}>();

const toolkit: ToolkitItem[] = [
  {
    name: "Select",
    mode: 'select',
  },
  {
    name: "Metal",
    mode: 'draw-metal',
    classes: 'bg-metal text-black font-bold',
  },
  {
    name: "P-Type",
    mode: 'draw-p-silicon',
    classes: 'bg-ptype text-black font-bold',
  },
  {
    name: "N-Type",
    mode: 'draw-n-silicon',
    classes: 'bg-ntype text-black font-bold',
  },
  {
    name: "Via",
    mode: 'draw-via',
    icon: '/tiles/link.png',
    classes: 'bg-neutral-400 text-black font-bold',
  },
  {
    name: "Erase",
    mode: 'erase',
  },
  {
    name: "Erase (Metal)",
    mode: 'erase-metal',
  },
  {
    name: "Erase (Silicon)",
    mode: 'erase-silicon',
  },
  {
    name: "Erase (Vias)",
    mode: 'erase-via',
  },
  {
    name: "Erase (Gates)",
    mode: 'erase-gate',
  },
];

const { mode } = useToolbox();

const onChange = (mode: ToolboxMode, prevMode: ToolboxMode) => {
  emit('change', mode, prevMode);
}

const onClickTool = (item: ToolkitItem) => {
  let toMode = item.mode;
  if (toMode === mode.value) {
    toMode = 'none';
  }
  const prevMode = mode.value;
  mode.value = toMode;
  onChange(toMode, prevMode);
}

</script>

<style scoped>

button {
  padding: 0;
  cursor: pointer;
}

</style>