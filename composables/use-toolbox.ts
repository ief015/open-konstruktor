export type ToolboxMode =
  | 'none'
  | 'select'
  | 'erase'
  | 'erase-metal'
  | 'erase-silicon'
  | 'erase-gate'
  | 'erase-via'
  | 'draw-metal'
  | 'draw-p-silicon'
  | 'draw-n-silicon'
  | 'draw-via'
  | 'toggle-probe';

interface ToolboxModeConfig {
  shiftMode?: ToolboxMode;
  ctrlMode?: ToolboxMode;
}

const modes: Record<ToolboxMode, ToolboxModeConfig> = {
  none: {},
  select: {},
  'draw-metal': {
    ctrlMode: 'erase-metal',
  },
  'draw-p-silicon': {
    ctrlMode: 'erase-silicon',
    shiftMode: 'draw-n-silicon',
  },
  'draw-n-silicon': {
    ctrlMode: 'erase-silicon',
    shiftMode: 'draw-p-silicon',
  },
  'draw-via': {
    ctrlMode: 'erase-via',
  },
  erase: {},
  'erase-metal': {
    shiftMode: 'erase',
  },
  'erase-silicon': {
    shiftMode: 'erase',
  },
  'erase-via': {
    shiftMode: 'erase',
  },
  'erase-gate': {
    shiftMode: 'erase',
  },
  'toggle-probe': {},
};

const modifiers = reactive({
  shift: false,
  control: false,
});

const _mode = ref<ToolboxMode>('none');
const mode = computed<ToolboxMode>({
  get() {
    const config = modes[_mode.value];
    if (modifiers.control && config.ctrlMode) {
      return config.ctrlMode!;
    }
    if (modifiers.shift && config.shiftMode) {
      return config.shiftMode!;
    }
    return _mode.value;
  },
  set(value) {
    _mode.value = value;
  },
});

const ignoreKeyShortcuts = ref(false);

export default function useToolbox() {
  return {
    mode,
    modifiers,
    ignoreKeyShortcuts,
  };
}
