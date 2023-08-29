import { CircuitSimulation, Network } from "@/simulation";

export interface CircuitSimulationFactory {
  setup: (network: Network) => CircuitSimulation;
  width?: number;
  height?: number;
  pinRows?: number;
}
