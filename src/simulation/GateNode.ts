import PathNode from "./PathNode";

export type GateType = 'pnp' | 'npn';

/**
 * 0: NPN, 1: PNP
 */
export type GateTypeEnum = number;

export default class GateNode {
  public gatedPaths: PathNode[] = []; // Paths of controlled flow
  public switchingPaths: PathNode[] = []; // Paths of switching state
  public active: boolean = false;
  public type: GateTypeEnum = 0;

  constructor(type: GateType = 'npn') {
    this.type = type === 'npn' ? 0 : 1;
  }
}
