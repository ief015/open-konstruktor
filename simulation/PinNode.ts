import { PathNode } from '@/simulation';

/**
 * A pin node represents an I/O connection point for the network.
 */
export class PinNode {
  /** When active, the connected path node will become high every step */
  public active: boolean;
  /** Label for the pin */
  public label: string;
  /** Path node connected to this pin */
  public path: PathNode;
  /** Flag indicating if this pin is to be treated as +VCC input */
  public isVCC: boolean = false;

  constructor(path: PathNode, label?: string);
  constructor(path: PathNode, active: boolean);
  constructor(path: PathNode, label: string, active: boolean);
  constructor(
    path: PathNode,
    label: string | boolean = '',
    active: boolean = false,
  ) {
    if (typeof label === 'boolean') {
      active = label;
      label = '';
    }
    this.path = path;
    this.label = label || 'N/C';
    this.active = active;
  }
}

/**
 * Mark this pin as VCC, sets label to 'VCC', and sets active.
 */
export function assignVCC(...pins: PinNode[]) {
  for (const pin of pins) {
    pin.label = 'VCC';
    pin.active = true;
    pin.isVCC = true;
  }
}
