<template>
  <div
    class="flex items-center gap-2 p-2"
    :class="{ 'flex-row': props.horizontal, 'flex-col': !props.horizontal }"
  >
    <div v-for="item in toolkit">
      <button
        @click="onClickTool(item)"
        :class="{ 'border-white': item.mode === mode }"
      >
        {{ item.name }}
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
  },
  {
    name: "P-Type",
    mode: 'draw-p-silicon',
  },
  {
    name: "N-Type",
    mode: 'draw-n-silicon',
  },
  {
    name: "Via",
    mode: 'draw-via',
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
