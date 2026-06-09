import { CircuitSimulation, Network, PinNode } from '@/simulation';

export interface LevelInfoPage {
  contentHtml: string;
}

export interface LevelInfo {
  title?: string;
  pages?: LevelInfoPage[];
}

export type CircuitSimulationFactories = { category: string } & (
  | { items: CircuitSimulationFactory[] }
  | { children: CircuitSimulationFactories[] }
);

export interface CircuitSimulationFactory {
  key: string;
  label?: string;
  width?: number;
  height?: number;
  pinRows?: number;
  regenOnLoop?: boolean;
  info?: LevelInfo;
  infoCompleted?: LevelInfo;
  nextLevelID?: string;
  setup: (network: Network) => CircuitSimulation;
}
