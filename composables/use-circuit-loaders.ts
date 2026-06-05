import type {
  CircuitSimulationFactories,
  CircuitSimulationFactory,
} from '@/circuits';
import { tutorial } from '@/circuits/tutorial';
import { openkonstruktor } from '@/circuits/open-konstruktor';
import { kohctpyktop } from '@/circuits/kohctpyktop';
import { debugLevels } from '@/circuits/debug-levels';

const findLoaderById = (
  loaders: CircuitSimulationFactories[],
  id: string,
): CircuitSimulationFactory | null => {
  for (const loader of loaders) {
    if ('items' in loader) {
      const found = loader.items.find((item) => item.key === id);
      if (found) {
        return found;
      }
    } else if ('children' in loader) {
      const found = findLoaderById(loader.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export default function useCircuitLoaders() {
  const cfg = useRuntimeConfig();
  const loaders: CircuitSimulationFactories[] = [
    tutorial,
    kohctpyktop,
    openkonstruktor,
    ...(cfg.public.dev ? [debugLevels] : []),
  ];
  return {
    loaders: loaders as Readonly<typeof loaders>,
    getLoader(id: string) {
      const loader = findLoaderById(loaders, id);
      if (!loader) {
        throw new Error(`No loader found for id: ${id}`);
      }
      return loader;
    },
  };
}
