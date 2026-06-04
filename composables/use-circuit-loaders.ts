import type { CircuitSimulationFactoryEntry } from '@/circuits';
import { tutorial } from '@/circuits/tutorial';
import { openkonstruktor } from '@/circuits/open-konstruktor';
import { kohctpyktop } from '@/circuits/kohctpyktop';

const loaders: Record<string, CircuitSimulationFactoryEntry> = {
  ...kohctpyktop,
  ...openkonstruktor,
  ...tutorial,
};

const getLoader = (id: string) => {
  const entry = loaders[id];
  if (!entry) {
    throw new Error(`No loader found for id: ${id}`);
  }
  return entry ? { key: id, ...entry } : undefined;
};

export default function useLevelInfo() {
  return {
    getLoader,
  };
}
