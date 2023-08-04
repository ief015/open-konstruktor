import { assertEqual } from "..";
import { PathNode, GateNode, PinNode, Network } from "../../simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinA = new PinNode();
  const pinY = new PinNode();

  const pnp = new GateNode('pnp');

  pnp.gatedPaths.push(pinVCC);
  pnp.gatedPaths.push(pinY);
  pnp.switchingPaths.push(pinA);

  const network = new Network(
    [pinVCC, pinA, pinY],
    [pnp],
  );

  // inactivity
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinY.state, true);
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinY.state, true);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, true);

  // pnp closes
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pinY.state, false);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, false);

  // pnp opens
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pinY.state, true);

}
