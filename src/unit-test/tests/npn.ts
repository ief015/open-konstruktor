import { assertEqual } from "@/unit-test";
import { GateNode, PinNode, Network, PathNode } from "@/simulation";

export default async function() {


  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathY = new PathNode();

  const npn = new GateNode('npn');

  npn.gatedPaths.push(pathVCC);
  npn.gatedPaths.push(pathY);
  npn.switchingPaths.push(pathA);

  const pinVCC = new PinNode(pathVCC, true);
  const pinA = new PinNode(pathA);
  const pinY = new PinNode(pathY);

  const network = new Network([
    pinVCC, pinA, pinY,
    pathVCC, pathA, pathY,
    npn,
  ]);

  // Inactivity
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathY.state, false);
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathY.state, false);

  // pinA active
  pinA.active = true;
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, false);

  // npn opens
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, true);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, true);
  assertEqual(pathY.state, true);

  // pinA unactive
  pinA.active = false;
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, true);

  // npn closes
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, false);

  // step 3x
  network.step();
  network.step();
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathA.state, false);
  assertEqual(pathY.state, false);

}
