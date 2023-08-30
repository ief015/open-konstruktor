import PathNode from "@/simulation/PathNode";

export default class PinNode {
  public active: boolean;
  public label: string;
  public path: PathNode;

  constructor(path: PathNode, label?: string)
  constructor(path: PathNode, active: boolean)
  constructor(path: PathNode, label: string, active: boolean)
  constructor(path: PathNode, label: string|boolean = '', active: boolean = false) {
    if (typeof label === 'boolean') {
      active = label;
      label = '';
    }
    this.path = path;
    this.label = label || 'N/C';
    this.active = active;
  }
}
