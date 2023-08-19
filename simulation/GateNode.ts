import PathNode from "@/simulation/PathNode";

export type GateType = 'pnp' | 'npn';

export default class GateNode {
  public gatedPaths: PathNode[] = []; // Paths of controlled flow
  public switchingPaths: PathNode[] = []; // Paths of switching state
  public active: boolean = false;
  public isNPN: boolean = true;

  constructor(type: GateType) {
    this.isNPN = type === 'npn';
  }
}
