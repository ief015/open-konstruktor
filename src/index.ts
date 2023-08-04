import { PathNode, GateNode, PinNode, Network, Timeline } from "./simulation";

const stateStr = (state: boolean) => state ? '1' : '-';

const pinVCC = new PinNode(true);
const pinS = new PinNode();
const pinR = new PinNode();
const pinQ = new PinNode();

const pathVCC = new PathNode();
const pathS = new PathNode();
const pathR = new PathNode();
const pathQ = new PathNode();

const pnp = new GateNode('pnp');
const npn = new GateNode('npn');

const network = new Network(
  [pathVCC, pathS, pathR, pathQ],
  [pnp, npn],
  [pinVCC, pinS, pinR, pinQ],
);

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

const tl = new Timeline();

tl.addKeyframe(2, pinS, true);
tl.addKeyframe(3, pinS, false);

tl.addKeyframe(6, pinR, true);
tl.addKeyframe(7, pinR, false);

tl.addKeyframe(10, pinVCC, false);

console.log('VCC\tS\tR\tQ');
tl.play(network, (frame) => {
  console.log(`${stateStr(pinVCC.state)}\t${stateStr(pinS.state)}\t${stateStr(pinR.state)}\t${stateStr(pinQ.state)}`);
});
