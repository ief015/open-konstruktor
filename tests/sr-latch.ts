import { assertEqual } from "@/utils/assert";
import { GateNode, PinNode, Network, PathNode } from "@/simulation";

export default async function() {

  const pathVCC = new PathNode();
  const pathS = new PathNode();
  const pathR = new PathNode();
  const pathQ = new PathNode();

  const pnp = new GateNode('pnp');
  const npn = new GateNode('npn');

  const pinVCC = new PinNode(pathVCC, true);
  const pinS = new PinNode(pathS);
  const pinR = new PinNode(pathR);
  const pinQ = new PinNode(pathQ);

  const network = new Network([
    pinVCC, pinS, pinR, pinQ,
    pathVCC, pathS, pathR, pathQ,
    pnp, npn,
  ]);

  npn.gatedPaths.push(pathVCC);
  npn.gatedPaths.push(pathQ);
  npn.switchingPaths.push(pathS);

  pnp.gatedPaths.push(pathS);
  pnp.gatedPaths.push(pathQ);
  pnp.switchingPaths.push(pathR);

  network.step();
  assertEqual(pathQ.state, false);

  // pinS active
  pinS.active = true;
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathQ.state, true);

  // pinS unactive but high path connected
  pinS.active = false;
  network.step();
  network.step();
  network.step();
  assertEqual(pathQ.state, true);
  assertEqual(pathS.state, true); // S should still be high, as its connected to VCC

  // pinR active
  pinR.active = true;
  network.step();
  assertEqual(pathS.state, true); // S is still high, should be low next step when pnp closes
  assertEqual(pathQ.state, true);

  // pinR unactive, S should now be low
  pinR.active = false;
  network.step();
  assertEqual(pathQ.state, true); // Q is still high, show be low next step when npn closes

  // npn should now be closed, Q should be low
  network.step();
  assertEqual(pathVCC.state, true);
  assertEqual(pathS.state, false);
  assertEqual(pathR.state, false);
  assertEqual(pathQ.state, false);

}
