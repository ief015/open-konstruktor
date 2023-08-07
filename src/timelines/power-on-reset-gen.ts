import { PathNode, GateNode, PinNode, Network, Timeline } from "@/simulation";

export default function play() {

  const pinVCC = new PinNode('VCC', true);
  const pinRST = new PinNode('RST');
  const pinRRST = new PinNode('/RST');

  const firstNPN = new GateNode('npn');
  firstNPN.gatedPaths.push(pinVCC);
  firstNPN.switchingPaths.push(pinVCC);

  const chainPaths: PathNode[] = [
    pinVCC,
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
  lastNPN.gatedPaths.push(pinRRST);

  const rPNP = new GateNode('pnp');
  rPNP.gatedPaths.push(pinVCC);
  rPNP.gatedPaths.push(pinRST);
  rPNP.switchingPaths.push(pinRRST);

  const network = new Network([
    ...chainPaths, pinRST, pinRRST,
    ...chainNPN, rPNP,
  ]);

  const tl = new Timeline(network);
  tl.run(16);
  tl.printHistory();
  console.log();

}
