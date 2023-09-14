import { CircuitSimulationFactory } from "@/circuits";
import { tutorial } from "@/circuits/tutorial";
import { openkonstruktor } from "@/circuits/open-konstruktor";
import { kohctpyktop } from "@/circuits/kohctpyktop";

const loaders: Record<string, CircuitSimulationFactory> = {
  ...kohctpyktop,
  ...openkonstruktor,
  ...tutorial,
};

const getLoader = (id: string) => {
  return loaders[id];
}

export default function useLevelInfo() {
  return {
    getLoader
  };
}
