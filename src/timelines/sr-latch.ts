import { PathNode, GateNode, PinNode, Network, Timeline } from "../simulation";

const stateStr = (state: boolean) => state ? '1' : '.';

export default function play() {

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

  const tl = new Timeline(network);

  tl.addKeyframe(2, pinS, true);
  tl.addKeyframe(7, pinS, false);
  tl.addKeyframe(6, pinR, true);
  tl.addKeyframe(7, pinR, false);
  tl.addKeyframe(10, pinR, true);
  tl.addKeyframe(11, pinR, false);
  tl.addKeyframe(13, pinS, true);
  tl.addKeyframe(14, pinS, false);
  tl.addKeyframe(17, pinR, true);
  tl.addKeyframe(18, pinR, false);
  tl.addKeyframe(21, pinS, true);
  tl.addKeyframe(22, pinS, false);

  console.log('\tVCC\tS\tR\tQ');
  tl.play(25, (frame) => {
    console.log(`${frame}\t${stateStr(pinVCC.state)}\t${stateStr(pinS.state)}\t${stateStr(pinR.state)}\t${stateStr(pinQ.state)}`);
  });
  console.log('');

  const tl2 = new Timeline(network);

  tl2.addKeyframe(4, pinS, true);
  tl2.addKeyframe(8, pinS, false);
  tl2.addKeyframe(12, pinS, true);
  tl2.addKeyframe(16, pinS, false);

  tl2.addKeyframe(4, pinR, true);
  tl2.addKeyframe(16, pinR, false);

  console.log('\tVCC\tS\tR\tQ');
  tl2.play(20, (frame) => {
    console.log(`${frame}\t${stateStr(pinVCC.state)}\t${stateStr(pinS.state)}\t${stateStr(pinR.state)}\t${stateStr(pinQ.state)}`);
  });
  console.log('');

}
