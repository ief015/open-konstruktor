"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const simulation_1 = require("../../simulation");
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        const pinVCC = new simulation_1.PinNode(true);
        const pinS = new simulation_1.PinNode();
        const pinR = new simulation_1.PinNode();
        const pinQ = new simulation_1.PinNode();
        const pathVCC = new simulation_1.PathNode();
        const pathS = new simulation_1.PathNode();
        const pathR = new simulation_1.PathNode();
        const pathQ = new simulation_1.PathNode();
        const pnp = new simulation_1.GateNode('pnp');
        const npn = new simulation_1.GateNode('npn');
        const network = new simulation_1.Network([pathVCC, pathS, pathR, pathQ], [pnp, npn], [pinVCC, pinS, pinR, pinQ]);
        pinVCC.connectedPaths.push(pathVCC);
        pinS.connectedPaths.push(pathS);
        pinR.connectedPaths.push(pathR);
        pinQ.connectedPaths.push(pathQ);
        npn.gatedPaths.push(pathVCC);
        npn.gatedPaths.push(pathQ);
        npn.switchingPaths.push(pathS);
        pnp.gatedPaths.push(pathS);
        pnp.gatedPaths.push(pathQ);
        pnp.switchingPaths.push(pathR);
        network.step();
        (0, __1.assertEqual)(pinQ.state, false);
        console.log('step: pinS active');
        pinS.active = true;
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pinQ.state, true);
        console.log('step: pinS unactive but high path connected');
        pinS.active = false;
        network.step();
        network.step();
        network.step();
        (0, __1.assertEqual)(pinQ.state, true);
        (0, __1.assertEqual)(pinS.state, true); // S should still be high, as its connected to VCC
        console.log('step: pinR active');
        pinR.active = true;
        network.step();
        (0, __1.assertEqual)(pinS.state, true); // S is still high, should be low next step when pnp closes
        (0, __1.assertEqual)(pinQ.state, true);
        console.log('step: pinR unactive, S should now be low');
        pinR.active = false;
        network.step();
        (0, __1.assertEqual)(pinQ.state, true); // Q is still high, show be low next step when npn closes
        console.log('step: npn should now be closed, Q should be low');
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pinS.state, false);
        (0, __1.assertEqual)(pinR.state, false);
        (0, __1.assertEqual)(pinQ.state, false);
    });
}
exports.default = default_1;
