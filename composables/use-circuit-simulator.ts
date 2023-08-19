import { kohctpyktop } from "@/circuits/kohctpyktop";
import { CircuitSimulation, FieldGraph, Network } from "@/simulation";

const sim = ref<CircuitSimulation>();
const network = ref<Network>();
const isRunning = ref(false);
const isPaused = ref(false);

export default function useCircuitSimulator() {

  const load = (field: FieldGraph) => {
    network.value = Network.from(field);
    sim.value = kohctpyktop['15 KR8S1 8-BIT ADDRESSABLE SRAM'](network.value);
    //sim.value = new CircuitSimulation(network.value);
  }

  return {
    sim,
    network,
    isRunning,
    isPaused,
    load,
  };
}