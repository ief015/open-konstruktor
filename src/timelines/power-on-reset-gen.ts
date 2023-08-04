import { PathNode, GateNode, PinNode, Network, Timeline } from "../simulation";

const stateStr = (state: boolean) => state ? '1' : '-';

export default function play() {

  const pinVCC = new PinNode(true);
  const pinRST = new PinNode();
  const pinRRST = new PinNode();

  const pathVCC = new PathNode();
  pinVCC.connectedPaths.push(pathVCC);
  const pathRST = new PathNode();
  pinRST.connectedPaths.push(pathRST);
  const pathRRST = new PathNode();
  pinRRST.connectedPaths.push(pathRRST);

  const firstNPN = new GateNode('npn');
  firstNPN.gatedPaths.push(pathVCC);
  firstNPN.switchingPaths.push(pathVCC);

  const chainPaths: PathNode[] = [
    pathVCC,
  ];
  const chainNPN: GateNode[] = [
    firstNPN,
  ];
  for (let i = 1; i < 8; i++) {
    const gate = new GateNode('npn');
    const path = new PathNode();
    chainNPN[i - 1].gatedPaths.push(path);
    gate.gatedPaths.push(path);
    gate.switchingPaths.push(path);
    chainNPN.push(gate);
    chainPaths.push(path);
  }

  const lastNPN = chainNPN[chainNPN.length - 1];
  lastNPN.gatedPaths.push(pathRRST);

  const rPNP = new GateNode('pnp');
  rPNP.gatedPaths.push(pathVCC);
  rPNP.gatedPaths.push(pathRST);
  rPNP.switchingPaths.push(pathRRST);

  const network = new Network(
    [...chainPaths, pathRST, pathRRST],
    [...chainNPN, rPNP],
    [pinVCC, pinRST, pinRRST],
  );

  const tl = new Timeline(network);

  console.log('\tVCC\tRST\t/RST');
  tl.play(16, (frame) => {
    console.log(`${frame}\t${stateStr(pinVCC.state)}\t${stateStr(pinRST.state)}\t${stateStr(pinRRST.state)}`);
  });

}
