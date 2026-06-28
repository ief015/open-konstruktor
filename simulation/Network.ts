import {
  FieldGraph,
  GateNode,
  PathNode,
  PinNode,
  type QueryResult,
} from '@/simulation';
import type { NetworkNode, Point } from '@/simulation';

type FoundGate = {
  query: QueryResult;
  point: Point;
};

export type GraphLayer = 'metal' | 'silicon';

export function getGraphKey(point: Point, layer: GraphLayer): string {
  return `${point[0]},${point[1]}:${layer === 'metal' ? 'm' : 's'}`;
}

export function getNodeState(node: NetworkNode): boolean {
  if (node instanceof PathNode) {
    return node.state;
  } else if (node instanceof GateNode) {
    return node.active === node.isNPN && node.currentPaths.some((p) => p.state);
  } else {
    return node.active || node.path?.state || false;
  }
}

export class Network {
  private paths: PathNode[] = [];
  private gates: GateNode[] = [];
  private pins: PinNode[] = [];

  private graph: Map<string, NetworkNode[]> = new Map();
  private dirty = true;

  constructor();
  constructor(nodes: NetworkNode[]);
  constructor(nodes?: NetworkNode[]) {
    if (!nodes) {
      return;
    }
    this.paths = nodes.filter((n) => n instanceof PathNode) as PathNode[];
    this.gates = nodes.filter((n) => n instanceof GateNode) as GateNode[];
    this.pins = nodes.filter((n) => n instanceof PinNode) as PinNode[];
  }

  public getPinNodes(): readonly PinNode[] {
    return this.pins;
  }

  public getPinNode(index: number): PinNode {
    const pin = this.pins[index];
    if (!pin) {
      throw new Error(`Pin at index ${index} does not exist`);
    }
    return pin;
  }

  public getPathNodes(): readonly PathNode[] {
    return this.paths;
  }

  public getPathNode(index: number): PathNode {
    const path = this.paths[index];
    if (!path) {
      throw new Error(`Path at index ${index} does not exist`);
    }
    return path;
  }

  public getGateNodes(): readonly GateNode[] {
    return this.gates;
  }

  public getGateNode(index: number): GateNode {
    const gate = this.gates[index];
    if (!gate) {
      throw new Error(`Gate at index ${index} does not exist`);
    }
    return gate;
  }

  public reset() {
    for (const path of this.paths) {
      path.state = false;
    }
    for (const gate of this.gates) {
      gate.active = false;
    }
    for (const pin of this.pins) {
      pin.lastActive = false;
    }
    this.dirty = true;
  }

  public step() {
    for (const pin of this.pins) {
      if (pin.active === pin.lastActive) continue;
      this.dirty = true;
      pin.lastActive = pin.active;
    }

    // Check for gates that should be toggled.
    // This is done outside gated path propagation to introduce propagation delay.
    for (const gate of this.gates) {
      const nextState = gate.basePaths.some((p) => p.state);
      if (nextState !== gate.active) {
        this.dirty = true;
      }
      gate.active = nextState;
    }

    if (!this.dirty) {
      return false;
    }
    this.dirty = false;

    // Reset state of all paths and pins
    for (const path of this.paths) {
      path.state = false;
    }
    for (const pin of this.pins) {
      if (pin.path && pin.active) {
        pin.path.state = true;
      }
    }

    // Propagate path states from gates
    while (true) {
      let anyChange = false;
      for (const { active, isNPN, currentPaths } of this.gates) {
        // TODO: Gates that have already passed current could be skipped for performance?
        // Needs investigation after more unit tests are written.
        if (active === isNPN && currentPaths.some((p) => p.state)) {
          for (const path of currentPaths) {
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
    return this.dirty;
  }

  private setGraphNode(point: Point, layer: GraphLayer, node: NetworkNode) {
    const key = getGraphKey(point, layer);
    const nodes = this.graph.get(key);
    if (nodes) {
      nodes.push(node);
    } else {
      this.graph.set(key, [node]);
    }
  }

  public getNodesAt(point: Point, layer?: GraphLayer): NetworkNode[] {
    if (layer) {
      const key = getGraphKey(point, layer);
      const nodes = this.graph.get(key);
      return nodes ?? [];
    } else {
      const metalNodes = this.getNodesAt(point, 'metal');
      const siliconNodes = this.getNodesAt(point, 'silicon');
      return metalNodes.concat(siliconNodes);
    }
  }

  public getNodeCount(): number {
    return this.paths.length + this.gates.length + this.pins.length;
  }

  // I barely know how everything under this line works. I'm sorry.
  // TODO: Simplify this.

  private buildPath(
    fieldGraph: FieldGraph,
    point: Point,
    layer: GraphLayer,
    node: PathNode,
  ): FoundGate[] | undefined {
    const nodesAtPoint = this.getNodesAt(point, layer);
    if (nodesAtPoint.length > 0) {
      return;
    }
    const foundGates: FoundGate[] = [];
    const query = fieldGraph.query(point);
    if (layer === 'metal' && query.metal) {
      this.setGraphNode(point, 'metal', node);
      for (const adjMetal of query.metalConnections) {
        foundGates.push(
          ...(this.buildPath(fieldGraph, adjMetal.point, 'metal', node) ?? []),
        );
      }
      if (query.via) {
        foundGates.push(
          ...(this.buildPath(fieldGraph, point, 'silicon', node) ?? []),
        );
      }
    } else if (layer === 'silicon' && query.silicon) {
      if (query.gate) {
        return [{ query, point }];
      }
      this.setGraphNode(point, 'silicon', node);
      for (const adjSilicon of query.siliconConnections) {
        foundGates.push(
          ...(this.buildPath(fieldGraph, adjSilicon.point, 'silicon', node) ??
            []),
        );
      }
      if (query.via) {
        foundGates.push(
          ...(this.buildPath(fieldGraph, point, 'metal', node) ?? []),
        );
      }
    }
    return foundGates;
  }

  private buildGate(
    field: FieldGraph,
    foundGate: FoundGate,
  ): {
    newGate?: GateNode;
    foundGates: FoundGate[];
  } {
    const { query, point } = foundGate;
    const nodesAtPoint = this.getNodesAt(point, 'silicon');
    if (nodesAtPoint.length > 0) {
      return { foundGates: [] };
    }
    const foundGates: FoundGate[] = [];
    const gate = new GateNode(query.silicon === 'p' ? 'pnp' : 'npn');
    this.setGraphNode(point, 'silicon', gate);
    this.gates.push(gate);
    for (const adjSilicon of query.siliconConnections) {
      const adjQuery = field.query(adjSilicon.point);
      const adjNode = this.getNodesAt(adjSilicon.point, 'silicon');
      if (adjQuery.gate) {
        // There's a gate directly adjacent to this gate, need an intermediate path
        if (!adjNode[0]) {
          const path = new PathNode();
          this.paths.push(path);
          gate.currentPaths.push(path);
          const { foundGates: more, newGate } = this.buildGate(field, {
            query: adjQuery,
            point: adjSilicon.point,
          });
          if (!newGate) {
            throw new Error('Failed to build gate');
          }
          if (query.gate === adjSilicon.direction) {
            newGate.basePaths.push(path);
          } else {
            newGate.currentPaths.push(path);
          }
          foundGates.push(...more);
        }
      } else {
        const adjPathNode = adjNode[0] as PathNode;
        if (adjPathNode) {
          if (query.gate === adjSilicon.direction) {
            gate.basePaths.push(adjPathNode);
          } else {
            gate.currentPaths.push(adjPathNode);
          }
        } else {
          const path = new PathNode();
          const more = this.buildPath(field, adjSilicon.point, 'silicon', path);
          if (more) {
            this.paths.push(path);
            foundGates.push(...more);
            if (query.gate === adjSilicon.direction) {
              gate.basePaths.push(path);
            } else {
              gate.currentPaths.push(path);
            }
          }
        }
      }
    }
    return { newGate: gate, foundGates };
  }

  public static from(saveString: string): Network;
  public static from(field: FieldGraph): Network;
  public static from(field: string | FieldGraph): Network {
    if (typeof field === 'string') {
      field = FieldGraph.from(field, 'circuit');
    }
    const network = new Network([]);
    const pins = field.getPinCount();
    const gates: FoundGate[] = [];
    // Build starting paths starting from each pin
    for (let i = 0; i < pins; i++) {
      const pinPoint = field.getPinPoint(i);
      const existing = network.getNodesAt(pinPoint, 'metal');
      if (existing.length > 0) {
        for (const node of existing) {
          if (node instanceof PathNode) {
            const pin = new PinNode(node);
            network.pins.push(pin);
            break;
          }
        }
      } else {
        const path = new PathNode();
        const pin = new PinNode(path);
        gates.push(
          ...(network.buildPath(field, pinPoint, 'metal', path) ?? []),
        );
        network.paths.push(path);
        network.pins.push(pin);
      }
    }
    // Build gates and connected paths until no more new gates are found
    for (let i = 0; i < gates.length; i++) {
      const gate = gates[i];
      gates.push(...network.buildGate(field, gate).foundGates);
    }
    return network;
  }
}
