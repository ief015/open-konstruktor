import { PathNode } from '@/simulation';

export type GateType = 'pnp' | 'npn';

/**
 * Represents a logical gate between paths.
 * Base paths are used to switch gate state; if one of these paths are high, the gate will become
 * active in the next network step.
 * While the gate is "open", it will propagate current to all current paths if any of them are high.
 * A gate is considered "open" if `active === isNPN`.
 */
export class GateNode {
  /** Paths for current propagation when gate is "open" */
  public currentPaths: PathNode[] = [];
  /** Paths for switching state */
  public basePaths: PathNode[] = [];
  /** Gates are considered "open" if `active === isNPN` */
  public active: boolean = false;
  /** `false` = pnp, `true` = npn */
  public isNPN: boolean = true;

  constructor(type: GateType) {
    this.isNPN = type === 'npn';
  }
}
