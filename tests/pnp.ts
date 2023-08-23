import { test } from "vitest";
import { assertEqual } from "@/utils/assert";
import { GateNode, PinNode, Network, PathNode } from "@/simulation";

test('pnp', () => {

  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathY = new PathNode();

  const pinVCC = new PinNode(pathVCC, true);
  const pinA = new PinNode(pathA);
  const pinY = new PinNode(pathY);

  const pnp = new GateNode('pnp');

  pnp.gatedPaths.push(pathVCC);
  pnp.gatedPaths.push(pathY);
  pnp.switchingPaths.push(pathA);

  const network = new Network([
    pinVCC, pinA, pinY,
    pathVCC, pathA, pathY,
    pnp,
  ]);

  // inactivity
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathY.state, true);
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathY.state, true);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, true);

  // pnp closes
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, false);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, false);

  // pnp opens
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, true);

});
