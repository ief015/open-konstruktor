"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GateNode {
    constructor(type = 'npn') {
        this.gatedPaths = []; // Paths of controlled flow
        this.switchingPaths = []; // Paths of switching state
        this.active = false;
        this.type = 'npn';
        this.type = type;
    }
}
exports.default = GateNode;
