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
        const pinA = new simulation_1.PinNode();
        const pinY = new simulation_1.PinNode();
        const pathVCC = new simulation_1.PathNode();
        const pathA = new simulation_1.PathNode();
        const pathY = new simulation_1.PathNode();
        const npn = new simulation_1.GateNode('npn');
        pinVCC.connectedPaths.push(pathVCC);
        pinA.connectedPaths.push(pathA);
        pinY.connectedPaths.push(pathY);
        npn.gatedPaths.push(pathVCC);
        npn.gatedPaths.push(pathY);
        npn.switchingPaths.push(pathA);
        const network = new simulation_1.Network([pathVCC, pathA, pathY], [npn], [pinVCC, pinA, pinY]);
        console.log('inactivity');
        network.step();
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinY.state, false);
        (0, __1.assertEqual)(pathY.state, false);
        network.step();
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinY.state, false);
        (0, __1.assertEqual)(pathY.state, false);
        console.log('pinA active');
        pinA.active = true;
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, true);
        (0, __1.assertEqual)(pathA.state, true);
        (0, __1.assertEqual)(pinY.state, false);
        (0, __1.assertEqual)(pathY.state, false);
        console.log('npn opens');
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, true);
        (0, __1.assertEqual)(pathA.state, true);
        (0, __1.assertEqual)(pinY.state, true);
        (0, __1.assertEqual)(pathY.state, true);
        console.log('step 3x');
        network.step();
        network.step();
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, true);
        (0, __1.assertEqual)(pathA.state, true);
        (0, __1.assertEqual)(pinY.state, true);
        (0, __1.assertEqual)(pathY.state, true);
        console.log('pinA unactive');
        pinA.active = false;
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, false);
        (0, __1.assertEqual)(pathA.state, false);
        (0, __1.assertEqual)(pinY.state, true);
        (0, __1.assertEqual)(pathY.state, true);
        console.log('npn closes');
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, false);
        (0, __1.assertEqual)(pathA.state, false);
        (0, __1.assertEqual)(pinY.state, false);
        (0, __1.assertEqual)(pathY.state, false);
        console.log('step 3x');
        network.step();
        network.step();
        network.step();
        (0, __1.assertEqual)(pinVCC.state, true);
        (0, __1.assertEqual)(pathVCC.state, true);
        (0, __1.assertEqual)(pinA.state, false);
        (0, __1.assertEqual)(pathA.state, false);
        (0, __1.assertEqual)(pinY.state, false);
        (0, __1.assertEqual)(pathY.state, false);
    });
}
exports.default = default_1;
