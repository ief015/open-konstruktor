import { PathNode, GateNode, PinNode, Network, Timeline } from "./simulation";

const stateStr = (state: boolean) => state ? '1' : '-';

const pinVCC = new PinNode(true);
const pinS = new PinNode();
const pinR = new PinNode();
const pinQ = new PinNode();

const pathVCC = new PathNode();
const pathS = new PathNode();
const pathS2 = new PathNode();
const pathR = new PathNode();
const pathQ = new PathNode();

const pnp = new GateNode('pnp');
const npn = new GateNode('npn');

const network = new Network(
  [pathVCC, pathS, pathS2, pathR, pathQ],
  [pnp, npn],
  [pinVCC, pinS, pinR, pinQ],
);

pinVCC.connectedPaths.push(pathVCC);
pinS.connectedPaths.push(pathS2);
pinR.connectedPaths.push(pathR);
pinQ.connectedPaths.push(pathQ);

npn.gatedPaths.push(pathVCC);
npn.gatedPaths.push(pathQ);
npn.switchingPaths.push(pathS);
npn.switchingPaths.push(pathS2);

pnp.gatedPaths.push(pathS);
pnp.gatedPaths.push(pathQ);
pnp.switchingPaths.push(pathR);

const tl = new Timeline();

tl.addKeyframe(2, pinS, true);
tl.addKeyframe(4, pinS, false);
tl.addKeyframe(6, pinR, true);
tl.addKeyframe(7, pinR, false);
tl.addKeyframe(10, pinR, true);
tl.addKeyframe(11, pinR, false);
tl.addKeyframe(13, pinS, true);
tl.addKeyframe(14, pinS, false);
tl.addKeyframe(17, pinR, true);
tl.addKeyframe(18, pinR, false);

tl.addKeyframe(20, pinVCC, false);

console.log('\tVCC\tS\tR\tQ');
tl.play(network, (frame) => {
  console.log(`${frame}\t${stateStr(pinVCC.state)}\t${stateStr(pinS.state)}\t${stateStr(pinR.state)}\t${stateStr(pinQ.state)}`);
});
