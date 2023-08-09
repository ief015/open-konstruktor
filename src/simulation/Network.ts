import FieldGraph, { QueryResult } from "@/simulation/FieldGraph";
import { GateNode, NetworkNode, PathNode, PinNode, Point } from "@/simulation";

type FoundGates = {
  node: NetworkNode,
  query: QueryResult
}

export default class Network {
  private paths: PathNode[] = [];
  private gates: GateNode[] = [];
  private pins: PinNode[] = [];

  private graph: Map<string, NetworkNode[]> = new Map();

  constructor();
  constructor(nodes: NetworkNode[]);
  constructor(nodes?: NetworkNode[]) {
    if (!nodes) {
      return;
    }
    this.paths = nodes.filter(n => n instanceof PathNode) as PathNode[];
    this.gates = nodes.filter(n => n instanceof GateNode) as GateNode[];
    this.pins = nodes.filter(n => n instanceof PinNode) as PinNode[];
  }

  public getPinNodes(): readonly PinNode[] {
    return this.pins;
  }

  public getPathNodes(): readonly PathNode[] {
    return this.paths;
  }

  public getGateNodes(): readonly GateNode[] {
    return this.gates;
  }

  public reset() {
    for (const path of this.paths) {
      path.state = false;
    }
    for (const gate of this.gates) {
      gate.active = false;
    }
  }

  public step() {
    // Reset state of all paths and pins
    for (const path of this.paths) {
      path.state = false;
    }
    for (const pin of this.pins) {
      if (pin.path) {
        pin.path.state = pin.active;
      }
    }

    while (true) {
      let anyChange = false;
      // Propagate path states from gates
      for (const gate of this.gates) {
        // TODO: Gates that have already passed current could be skipped for performance?
        // Needs investigation after more unit tests are written.
        const open = gate.isNPN ? gate.active : !gate.active;
        if (open && gate.gatedPaths.some(p => p.state)) {
          for (const path of gate.gatedPaths) {
            if (!path.state) {
              path.state = true;
              anyChange = true;
            }
          }
        }
      }
      if (!anyChange) {
        break;
      }
    }
    // Check for gates that should be toggled.
    // This is done after gated path propagation to introduce propagation delay.
    for (const gate of this.gates) {
      gate.active = gate.switchingPaths.some(p => p.state);
    }
  }

  private getGraphKey(point: Point): string {
    return point.join(',');
  }

  public getNodesAt(point: Point): NetworkNode[] {
    const key = this.getGraphKey(point);
    const nodes = this.graph.get(key);
    return nodes ?? [];
  }

  public getNodeCount(): number {
    return this.paths.length + this.gates.length + this.pins.length;
  }

  public static from(graph: FieldGraph): Network {
    const network = new Network([]);
    // TODO
    return network;
  }

}
