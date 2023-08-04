import PathNode from "./PathNode";

export default class PinNode extends PathNode {
  public active: boolean = false;

  constructor(active: boolean = false) {
    super();
    this.active = active;
  }
}
