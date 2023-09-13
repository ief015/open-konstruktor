import { CircuitSimulation, Network } from "@/simulation";

export interface LevelInfoPage {
  contentHtml: string;
  levelLinkID?: string;
}

export type LevelInfo = {
  title?: string;
  pages: LevelInfoPage[];
}

export interface CircuitSimulationFactory {
  setup: (network: Network) => CircuitSimulation;
  width?: number;
  height?: number;
  pinRows?: number;
  regenOnLoop?: boolean;
  info?: LevelInfo;
  infoCompleted?: LevelInfo;
}
