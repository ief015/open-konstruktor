export type ToolboxMode = 'none' | 'select' |
  'erase' | 'erase-metal' | 'erase-silicon' | 'erase-gate' | 'erase-via' |
  'draw-metal' | 'draw-p-silicon' | 'draw-n-silicon' | 'draw-via';

const mode = ref<ToolboxMode>('none');

export default function useToolbox() {
  return {
    mode,
  };
}