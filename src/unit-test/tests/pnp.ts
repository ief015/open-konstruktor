import { assertEqual } from "..";
import { PathNode, GateNode, PinNode, Network } from "../../simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinA = new PinNode();
  const pinY = new PinNode();

  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathY = new PathNode();

  const pnp = new GateNode('pnp');

  pinVCC.connectedPaths.push(pathVCC);
  pinA.connectedPaths.push(pathA);
  pinY.connectedPaths.push(pathY);

  pnp.gatedPaths.push(pathVCC);
  pnp.gatedPaths.push(pathY);
  pnp.switchingPaths.push(pathA);

  const network = new Network(
    [pathVCC, pathA, pathY],
    [pnp],
    [pinVCC, pinA, pinY],
  );

  // inactivity
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // pnp closes
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, false);
  assertEqual(pathY.state, false);

  // pnp opens
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pinA.state, false);
  assertEqual(pathA.state, false);
  assertEqual(pinY.state, true);
  assertEqual(pathY.state, true);

}
