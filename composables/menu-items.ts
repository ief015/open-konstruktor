import type { CircuitSimulationFactories } from '@/circuits';
import type { MenuBarItem } from '@/components/menu/bar.vue';

function mapLoaderToMenuItem(loader: CircuitSimulationFactories): MenuBarItem {
  if ('items' in loader) {
    return {
      label: loader.category,
      items: loader.items.map((item) => ({
        id: `level/${item.key}`,
        label: item.label || item.key,
      })),
    };
  } else if ('children' in loader) {
    return {
      label: loader.category,
      items: loader.children.map(mapLoaderToMenuItem),
    };
  }
  throw new Error('Invalid loader structure');
}

export function useMenuItems() {
  const { loaders } = useCircuitLoaders();
  const clipboard = inject<ReturnType<typeof useClipboard>>('clipboard');
  const selection = useSelection();
  const { history } = useFieldGraph();
  const { isRunning } = useCircuitSimulator();
  const levelItems = computed((): MenuBarItem[] =>
    loaders.map(mapLoaderToMenuItem),
  );
  const items = computed((): MenuBarItem[] => [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'file/import', label: 'Import' },
        { id: 'file/export', label: 'Export' },
        'divider',
        {
          label: 'Saved Designs',
          items: [
            { id: 'file/import-designs', label: 'Import Designs' },
            { id: 'file/export-designs', label: 'Export Designs' },
          ],
        },
        {
          label: 'Snippets',
          items: [
            { id: 'file/import-snippets', label: 'Import Snippets' },
            { id: 'file/export-snippets', label: 'Export Snippets' },
          ],
        },
        'divider',
        { id: 'file/welcome', label: 'Welcome' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'edit/undo',
          label: 'Undo',
          disabled: isRunning.value || !history.canUndo.value,
        },
        {
          id: 'edit/redo',
          label: 'Redo',
          disabled: isRunning.value || !history.canRedo.value,
        },
        'divider',
        {
          id: 'edit/cut',
          label: 'Cut',
          disabled: isRunning.value || !selection.bounds.value,
        },
        { id: 'edit/copy', label: 'Copy', disabled: !selection.bounds.value },
        {
          id: 'edit/paste',
          label: 'Paste',
          disabled:
            isRunning.value || !clipboard || clipboard.text.value.length === 0,
        },
        {
          id: 'edit/delete',
          label: 'Delete',
          disabled: isRunning.value || !selection.bounds.value,
        },
        'divider',
        { id: 'edit/clear', label: 'Clear', disabled: isRunning.value },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { id: 'view/reset', label: 'Center' },
        'divider',
        { id: 'view/zoom-in', label: 'Zoom In' },
        { id: 'view/zoom-out', label: 'Zoom Out' },
        { id: 'view/zoom-reset', label: 'Reset Zoom' },
        'divider',
        { id: 'view/toggle-debug', label: 'Toggle Debug' },
      ],
    },
    {
      id: 'levels',
      label: 'Levels',
      items: levelItems.value,
    },
  ]);
  return {
    items,
  };
}
