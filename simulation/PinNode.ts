import { PathNode } from '@/simulation';

export class PinNode {
  public active: boolean;
  public label: string;
  public path: PathNode;
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
 * Assign a pin as VCC: Sets label to 'VCC' and always stays active.
 */
export function assignVCC(...pins: PinNode[]) {
  for (const pin of pins) {
    pin.label = 'VCC';
    pin.active = true;
    pin.isVCC = true;
  }
}
