import PathNode from "@/simulation/PathNode";

export default class PinNode extends PathNode {
  public active: boolean;
  public label: string;

  constructor(label?: string)
  constructor(active: boolean)
  constructor(label: string, active: boolean)
  constructor(label: string|boolean = '', active: boolean = false) {
    super();
    if (typeof label === 'boolean') {
      active = label;
      label = '';
    }
    this.label = label;
    this.active = active;
  }
}
