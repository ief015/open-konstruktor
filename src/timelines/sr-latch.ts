import { PathNode, GateNode, PinNode, Network, Timeline } from "@/simulation";

export default function play() {

  const pathVCC = new PathNode();
  const pathS = new PathNode();
  const pathR = new PathNode();
  const pathQ = new PathNode();

  const pinVCC = new PinNode(pathVCC, 'VCC', true);
  const pinS = new PinNode(pathS, 'S');
  const pinR = new PinNode(pathR, 'R');
  const pinQ = new PinNode(pathQ, 'Q');

  const pathCell = new PathNode();

  const pnp = new GateNode('pnp');
  const npn = new GateNode('npn');

  const network = new Network([
    pinVCC, pinS, pinR, pinQ,
    pathVCC, pathS, pathR, pathQ, pathCell,
    pnp, npn,
  ]);

  npn.gatedPaths.push(pathVCC);
  npn.gatedPaths.push(pathQ);
  npn.switchingPaths.push(pathCell);
  npn.switchingPaths.push(pathS);

  pnp.gatedPaths.push(pathCell);
  pnp.gatedPaths.push(pathQ);
  pnp.switchingPaths.push(pathR);

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
