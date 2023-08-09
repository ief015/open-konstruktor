import { PathNode, GateNode, PinNode, Network, Timeline } from "@/simulation";

export default function play() {

  const pathVCC = new PathNode();
  const pathRST = new PathNode();
  const pathRRST = new PathNode();

  const pinVCC = new PinNode(pathVCC, 'VCC', true);
  const pinRST = new PinNode(pathRST, 'RST');
  const pinRRST = new PinNode(pathRRST, '/RST');

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

  const network = new Network([
    pinVCC, pinRST, pinRRST,
    ...chainPaths, pathRST, pathRRST,
    ...chainNPN, rPNP,
  ]);

  const tl = new Timeline(network);
  tl.run(16);
  tl.printHistory();
  console.log();

}
