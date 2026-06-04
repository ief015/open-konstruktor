import type { CircuitSimulationFactories } from '@/circuits';
import type { MenuBarItem } from '@/components/menu/bar2.vue';

export type MenuItem =
  | {
      id?: string;
      name: string;
      menu?: MenuItem[];
    }
  | {
      isDivider: true;
    };

function mapLoaderToMenuItem(loader: CircuitSimulationFactories): MenuItem {
  if ('items' in loader) {
    return {
      name: loader.category,
      menu: loader.items.map((item) => ({
        id: `level/${item.key}`,
        name: item.label || item.key,
      })),
    };
  } else if ('children' in loader) {
    return {
      name: loader.category,
      menu: loader.children.map(mapLoaderToMenuItem),
    };
  }
  throw new Error('Invalid loader structure');
}

function mapLoaderToMenuItem2(loader: CircuitSimulationFactories): MenuBarItem {
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
      items: loader.children.map(mapLoaderToMenuItem2),
    };
  }
  throw new Error('Invalid loader structure');
}

export function useMenuItems() {
  const { loaders } = useCircuitLoaders();
  const levelItems = computed((): MenuItem[] =>
    loaders.map(mapLoaderToMenuItem),
  );
  const levelItems2 = computed((): MenuBarItem[] =>
    loaders.map(mapLoaderToMenuItem2),
  );
  const items = computed((): MenuItem[] => [
    {
      name: 'File',
      menu: [
        { id: 'file/load-design', name: 'Load Design' },
        { id: 'file/save-design', name: 'Save Design' },
        { isDivider: true },
        { id: 'file/import', name: 'Import' },
        { id: 'file/export', name: 'Export' },
        { isDivider: true },
        { id: 'file/clear', name: 'Clear' },
      ],
    },
    {
      name: 'View',
      menu: [{ id: 'view/reset', name: 'Center' }],
    },
    {
      name: 'Levels',
      menu: levelItems.value,
    },
  ]);
  const items2 = computed((): MenuBarItem[] => [
    {
      label: 'File',
      items: [
        { id: 'file/load-design', label: 'Load Design' },
        { id: 'file/save-design', label: 'Save Design' },
        'divider',
        { id: 'file/import', label: 'Import' },
        { id: 'file/export', label: 'Export' },
        'divider',
        { id: 'file/clear', label: 'Clear' },
      ],
    },
    {
      label: 'View',
      items: [{ id: 'view/reset', label: 'Center' }],
    },
    {
      label: 'Levels',
      items: levelItems2.value,
    },
  ]);
  return {
    items,
    items2,
  };
}
