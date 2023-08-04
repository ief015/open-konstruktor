import { assertEqual } from "..";
import { PathNode, GateNode, PinNode, Network } from "../../simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinA = new PinNode();
  const pinY = new PinNode();

  const npn = new GateNode('npn');

  npn.gatedPaths.push(pinVCC);
  npn.gatedPaths.push(pinY);
  npn.switchingPaths.push(pinA);

  const network = new Network(
    [pinVCC, pinA, pinY],
    [npn],
  );

  // Inactivity
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinY.state, false);
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinY.state, false);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, false);

  // npn opens
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, true);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, true);

  // npn closes
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, false);

}
