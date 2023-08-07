import { PathNode, GateNode, PinNode, Network, Timeline } from "@/simulation";

export default function play() {

  const pinVCC = new PinNode('VCC', true);
  const pinS = new PinNode('S');
  const pinR = new PinNode('R');
  const pinQ = new PinNode('Q');

  const pathCell = new PathNode();

  const pnp = new GateNode('pnp');
  const npn = new GateNode('npn');

  const network = new Network([
    pinVCC, pinS, pinR, pinQ, pathCell,
    pnp, npn,
  ]);

  npn.gatedPaths.push(pinVCC);
  npn.gatedPaths.push(pinQ);
  npn.switchingPaths.push(pathCell);
  npn.switchingPaths.push(pinS);

  pnp.gatedPaths.push(pathCell);
  pnp.gatedPaths.push(pinQ);
  pnp.switchingPaths.push(pinR);

  const tl = new Timeline(network);

  tl.addKeyFrame(2, pinS, true);
  tl.addKeyFrame(7, pinS, false);
  tl.addKeyFrame(6, pinR, true);
  tl.addKeyFrame(7, pinR, false);
  tl.addKeyFrame(10, pinR, true);
  tl.addKeyFrame(11, pinR, false);
  tl.addKeyFrame(13, pinS, true);
  tl.addKeyFrame(14, pinS, false);
  tl.addKeyFrame(17, pinR, true);
  tl.addKeyFrame(18, pinR, false);
  tl.addKeyFrame(21, pinS, true);
  tl.addKeyFrame(22, pinS, false);

  tl.run(25);
  tl.printHistory();
  console.log();

  const tl2 = new Timeline(network);

  tl2.addKeyFrame(4, pinS, true);
  tl2.addKeyFrame(8, pinS, false);
  tl2.addKeyFrame(12, pinS, true);
  tl2.addKeyFrame(16, pinS, false);

  tl2.addKeyFrame(4, pinR, true);
  tl2.addKeyFrame(16, pinR, false);

  tl2.run(20);
  tl2.printHistory();
  console.log();

}
