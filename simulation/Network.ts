import FieldGraph from "@/simulation/FieldGraph";
import type { QueryResult } from "@/simulation/FieldGraph";
import { GateNode, PathNode, PinNode } from "@/simulation";
import type { NetworkNode, Point } from "@/simulation";


type FoundGate = {
  query: QueryResult;
  point: Point;
}

export type GraphLayer = 'metal'|'silicon';

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

    // Check for gates that should be toggled.
    // This is done outside gated path propagation to introduce propagation delay.
    for (const gate of this.gates) {
      gate.active = gate.switchingPaths.some(p => p.state);
    }

    // Reset state of all paths and pins
    for (const path of this.paths) {
      path.state = false;
    }
    for (const pin of this.pins) {
      if (pin.path && pin.active) {
        pin.path.state = true;
      }
    }

    while (true) {
      let anyChange = false;
      // Propagate path states from gates
      for (const { active, isNPN, gatedPaths } of this.gates) {
        // TODO: Gates that have already passed current could be skipped for performance?
        // Needs investigation after more unit tests are written.
        const open = isNPN ? active : !active;
        if (open && gatedPaths.some(p => p.state)) {
          for (const path of gatedPaths) {
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
  }

  private getGraphKey(point: Point, layer: GraphLayer): string {
    return point.join(',') + ':' + (layer === 'metal' ? 'm' : 's');
  }

  private setGraphNode(point: Point, layer: GraphLayer, node: NetworkNode) {
    const key = this.getGraphKey(point, layer);
    const nodes = this.graph.get(key);
    if (nodes) {
      nodes.push(node);
    } else {
      this.graph.set(key, [node]);
    }
  }

  public getNodesAt(point: Point, layer?: GraphLayer): NetworkNode[] {
    if (layer) {
      const key = this.getGraphKey(point, layer);
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
  ): FoundGate[]|undefined {
    const nodesAtPoint = this.getNodesAt(point, layer);
    if (nodesAtPoint.length > 0) {
      return;
    }
    const foundGates: FoundGate[] = [];
    const query = fieldGraph.query(point);
    if (layer === 'metal' && query.metal) {
      this.setGraphNode(point, 'metal', node);
      for (const adjMetal of query.metalConnections) {
        foundGates.push(...(this.buildPath(fieldGraph, adjMetal.point, 'metal', node) ?? []));
      }
      if (query.via) {
        foundGates.push(...(this.buildPath(fieldGraph, point, 'silicon', node) ?? []));
      }
    } else if (layer === 'silicon' && query.silicon) {
      if (query.gate) {
        return [ { query, point } ];
      }
      this.setGraphNode(point, 'silicon', node);
      for (const adjSilicon of query.siliconConnections) {
        foundGates.push(...(this.buildPath(fieldGraph, adjSilicon.point, 'silicon', node) ?? []));
      }
      if (query.via) {
        foundGates.push(...(this.buildPath(fieldGraph, point, 'metal', node) ?? []));
      }
    }
    return foundGates;
  }

  private buildGate(fieldGraph: FieldGraph, foundGate: FoundGate): {
    newGate?: GateNode
    foundGates: FoundGate[]
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
      const adjQuery = fieldGraph.query(adjSilicon.point);
      const adjNode = this.getNodesAt(adjSilicon.point, 'silicon');
      if (adjQuery.gate) {
        // There's a gate directly adjacent to this gate, need an intermediate path
        if (!adjNode[0]) {
          const path = new PathNode();
          this.paths.push(path);
          gate.gatedPaths.push(path);
          const { foundGates: more, newGate } = this.buildGate(fieldGraph, { query: adjQuery, point: adjSilicon.point });
          if (!newGate) {
            throw new Error('Failed to build gate');
          }
          if (query.gate === adjSilicon.direction) {
            newGate.switchingPaths.push(path);
          } else {
            newGate.gatedPaths.push(path);
          }
          foundGates.push(...more);
        }
      } else {
        const adjPathNode = adjNode[0] as PathNode;
        if (adjPathNode) {
          if (query.gate === adjSilicon.direction) {
            gate.switchingPaths.push(adjPathNode);
          } else {
            gate.gatedPaths.push(adjPathNode);
          }
        } else {
          const path = new PathNode();
          const more = this.buildPath(fieldGraph, adjSilicon.point, 'silicon', path);
          if (more) {
            this.paths.push(path);
            foundGates.push(...more);
            if (query.gate === adjSilicon.direction) {
              gate.switchingPaths.push(path);
            } else {
              gate.gatedPaths.push(path);
            }
          }
        }
      }
    }
    return { newGate: gate, foundGates };
  }

  public static from(saveString: string): Network;
  public static from(graph: FieldGraph): Network;
  public static from(graph: string|FieldGraph): Network {
    if (typeof graph === 'string') {
      graph = FieldGraph.from(graph, 'circuit');
    }
    const network = new Network([]);
    const pins = graph.getPinCount();
    const gates: FoundGate[] = [];
    // Build starting paths starting from each pin
    for (let i = 0; i < pins; i++) {
      const pinPoint = graph.getPinPoint(i);
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
        gates.push(...(network.buildPath(graph, pinPoint, 'metal', path) ?? []));
        network.paths.push(path);
        network.pins.push(pin);
      }
    }
    // Build gates and connected paths until no more new gates are found
    for (let i = 0; i < gates.length; i++) {
      const gate = gates[i];
      gates.push(...network.buildGate(graph, gate).foundGates);
    }
    return network;
  }

}
