import type { CircuitSimulationFactories } from '@/circuits';

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

export function useMenuItems() {
  const { loaders } = useCircuitLoaders();
  const levelItems = computed((): MenuItem[] =>
    loaders.map(mapLoaderToMenuItem),
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
  return {
    items,
  };
}
