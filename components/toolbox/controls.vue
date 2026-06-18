<template>
  <div
    class="flex items-center gap-2"
    :class="{ 'flex-row': props.horizontal, 'flex-col': !props.horizontal }"
  >
    <div v-for="item in toolkit" class="w-full">
      <div
        v-if="item === 'divider'"
        class="my-1"
        style="border-top: 1px solid #666"
      />
      <button
        v-else
        @click="onClickTool(item)"
        class="relative flex items-center justify-center w-full h-[3em] rounded border-solid border-2"
        :class="{
          [item.classes ?? '']: true,
          'border-white': item.mode === mode,
          'border-neutral-600': item.mode !== mode,
          'hover:border-neutral-300': item.mode !== mode,
        }"
        :title="item.description"
      >
        <img v-if="item.icon" :src="item.icon" class="w-[12px] h-[12px]" />
        <span>{{ item.name }}</span>
        <span
          class="absolute top-0 right-0.5 opacity-60 font-georgia10 text-[10px]"
        >
          {{ item.key }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolboxMode } from '@/composables/use-toolbox';

interface ToolkitItem {
  name: string;
  icon?: string;
  mode: ToolboxMode;
  classes?: string;
  description?: string;
  key?: string;
}

const props = withDefaults(
  defineProps<{
    horizontal?: boolean;
  }>(),
  {
    horizontal: false,
  },
);

const emit = defineEmits<{
  change: [mode: ToolboxMode, prevMode: ToolboxMode];
}>();

const toolkit: (ToolkitItem | 'divider')[] = [
  {
    name: 'Select',
    mode: 'select',
    description:
      'Click + drag selection tool. Drag selection to move, hold shift to duplicate. R to rotate. F (+ Shift) to flip',
    key: '1',
  },
  'divider',
  {
    name: 'Metal',
    mode: 'draw-metal',
    classes: 'bg-metal text-black font-semibold',
    description:
      'Metal tool. Basic conductor, can connect to pins. Connects to silicon with vias.',
    key: '2',
  },
  {
    name: 'P-Type',
    mode: 'draw-p-silicon',
    classes: 'bg-ptype text-black font-semibold',
    description:
      'P-Type silicon tool. Connect N-Type silicon with this to create a PNP gate.',
    key: '3',
  },
  {
    name: 'N-Type',
    mode: 'draw-n-silicon',
    classes: 'bg-ntype text-white font-semibold',
    description:
      'N-Type silicon tool. Connect P-Type silicon with this to create an NPN gate.',
    key: '4',
  },
  {
    name: 'Via',
    mode: 'draw-via',
    icon: '/tiles/link.png',
    classes: 'bg-neutral-400 text-black font-semibold',
    description: 'Via tool. Place on silicon to connect to metal layer.',
    key: '5',
  },
  'divider',
  {
    name: 'Erase',
    mode: 'erase',
    description: 'Eraser tool. Removes material from all layers.',
    key: '6',
  },
  {
    name: 'Erase (Metal)',
    mode: 'erase-metal',
    description: 'Metal eraser. Removes only metal.',
    key: '7',
  },
  {
    name: 'Erase (Silicon)',
    mode: 'erase-silicon',
    description: 'Silicon eraser. Removes only silicon.',
    key: '8',
  },
  {
    name: 'Erase (Vias)',
    mode: 'erase-via',
    description: 'Via eraser. Removes only vias.',
    key: '9',
  },
  {
    name: 'Erase (Gates)',
    mode: 'erase-gate',
    description: 'Gate eraser. Disconnects gates without removing silicon.',
    key: '0',
  },
  'divider',
  {
    name: 'Probe',
    mode: 'toggle-probe',
    description:
      'Probe tool. Place to inspect signals within the circuit. Hold shift to label. Click again to remove.',
    key: 'p',
  },
];

const { mode, modifiers, ignoreKeyShortcuts } = useToolbox();

const status = useStatusBar();

const onChange = (mode: ToolboxMode, prevMode: ToolboxMode) => {
  emit('change', mode, prevMode);
};

const onClickTool = (item: ToolkitItem) => {
  const toMode = item.mode === mode.value ? 'none' : item.mode;
  const prevMode = mode.value;
  mode.value = toMode;
  if (toMode === 'none') {
    status.setText('');
  } else {
    status.setText(item.description ?? '');
  }
  onChange(toMode, prevMode);
};

useEventListener('keypress', (ev) => {
  if (ignoreKeyShortcuts.value) return;
  if (ev.key >= '0' && ev.key <= '9') {
    const item = toolkit.find((item) => {
      return item !== 'divider' && item.key === ev.key;
    }) as ToolkitItem | undefined;
    if (item) {
      onClickTool(item);
    }
  }
});

useEventListener('keydown', (ev) => {
  if (ignoreKeyShortcuts.value) return;
  const k = ev.key.toLowerCase();
  if (k == 'shift') {
    modifiers.shift = true;
  }
  if (k == 'control') {
    modifiers.control = true;
  }
});

useEventListener('keyup', (ev) => {
  if (ignoreKeyShortcuts.value) {
    return;
  }
  const k = ev.key.toLowerCase();
  if (k == 'shift') {
    modifiers.shift = false;
  }
  if (k == 'control') {
    modifiers.control = false;
  }
});
</script>

<style scoped>
button {
  padding: 0;
  cursor: pointer;
}
</style>
