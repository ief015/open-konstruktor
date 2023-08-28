import { CircuitSimulation, Network } from "@/simulation";

export type CircuitSimulationFactory = (network: Network) => CircuitSimulation;
