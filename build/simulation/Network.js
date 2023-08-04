"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkFromGraph = void 0;
function networkFromGraph(graph) {
    const paths = [];
    const gates = [];
    const pins = [];
    // TODO: Build the network from the graph
    return new Network(paths, gates, pins);
}
exports.networkFromGraph = networkFromGraph;
class Network {
    constructor(paths, gates, pins) {
        this.paths = [];
        this.gates = [];
        this.pins = [];
        this.paths = paths;
        this.gates = gates;
        this.pins = pins;
    }
    step() {
        // Reset state of all paths
        for (const path of this.paths) {
            path.state = false;
        }
        for (const pin of this.pins) {
            pin.state = pin.active;
        }
        while (true) {
            let anyChange = false;
            // Propagate path states from active pins
            for (const pin of this.pins) {
                if (!pin.state) {
                    // Check if state should be high due to connected high paths
                    for (const path of pin.connectedPaths) {
                        if (path.state) {
                            pin.state = true;
                        }
                    }
                }
                if (pin.state) {
                    // Set connected paths to high
                    for (const path of pin.connectedPaths) {
                        if (!path.state) {
                            path.state = true;
                            anyChange = true;
                        }
                    }
                }
            }
            // Propagate path states from gates
            for (const gate of this.gates) {
                const open = gate.type === 'npn' ? gate.active : !gate.active;
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
}
exports.default = Network;
