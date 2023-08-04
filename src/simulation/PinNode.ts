import PathNode from "./PathNode";

export default class PinNode {
  public connectedPaths: PathNode[] = [];
  public state: boolean = false;
  public active: boolean = false;

  constructor(active: boolean = false) {
    this.active = active;
  }
}
