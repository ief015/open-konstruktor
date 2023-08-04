import { assertEqual } from "..";
import { PathNode, GateNode, PinNode, Network } from "../../simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinA = new PinNode();
  const pinY = new PinNode();

  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathY = new PathNode();

  const npn = new GateNode('npn');

  pinVCC.connectedPaths.push(pathVCC);
  pinA.connectedPaths.push(pathA);
  pinY.connectedPaths.push(pathY);

  npn.gatedPaths.push(pathVCC);
  npn.gatedPaths.push(pathY);
  npn.switchingPaths.push(pathA);

  const network = new Network(
    [pathVCC, pathA, pathY],
    [npn],
    [pinVCC, pinA, pinY],
  );

  // Inactivity
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // npn opens
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // npn closes
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

}
