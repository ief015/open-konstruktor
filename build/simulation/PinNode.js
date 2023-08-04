"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PinNode {
    constructor(active = false) {
        this.connectedPaths = [];
        this.state = false;
        this.active = false;
        this.active = active;
    }
}
exports.default = PinNode;
