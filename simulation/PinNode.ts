import PathNode from '@/simulation/PathNode';

export class PinNode {
  public active: boolean;
  public label: string;
  public path: PathNode;

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

export class VCCPinNode extends PinNode {
  public isVCC: true = true;

  constructor(path: PathNode) {
    super(path, 'VCC', true);
  }
}

/**
 * Convert pins to VCC pins in-place.
 */
export function assignVCC(...pins: PinNode[]): VCCPinNode[] {
  return pins.map((pin) => {
    pin.label = 'VCC';
    pin.active = true;
    (pin as VCCPinNode).isVCC = true;
    return pin as VCCPinNode;
  });
}

export function isVCCPinNode(pin: PinNode): pin is VCCPinNode {
  return (pin as VCCPinNode).isVCC === true;
}
