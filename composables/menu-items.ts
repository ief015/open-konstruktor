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
  const levelItems = computed((): MenuBarItem[] =>
    loaders.map(mapLoaderToMenuItem),
  );
  const items = computed((): MenuBarItem[] => [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'file/load-design', label: 'Load Design' },
        { id: 'file/save-design', label: 'Save Design' },
        'divider',
        { id: 'file/import', label: 'Import' },
        { id: 'file/export', label: 'Export' },
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
          disabled: !history.canUndo.value,
        },
        { id: 'edit/redo', label: 'Redo', disabled: !history.canRedo.value },
        'divider',
        { id: 'edit/cut', label: 'Cut', disabled: !selection.bounds.value },
        { id: 'edit/copy', label: 'Copy', disabled: !selection.bounds.value },
        {
          id: 'edit/paste',
          label: 'Paste',
          disabled: !clipboard || clipboard.text.value.length === 0,
        },
        {
          id: 'edit/delete',
          label: 'Delete',
          disabled: !selection.bounds.value,
        },
        'divider',
        { id: 'edit/clear', label: 'Clear' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [{ id: 'view/reset', label: 'Center' }],
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
