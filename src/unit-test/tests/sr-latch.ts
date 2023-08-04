import { assertEqual } from "..";
import { PathNode, GateNode, PinNode, Network } from "../../simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinS = new PinNode();
  const pinR = new PinNode();
  const pinQ = new PinNode();

  const pathVCC = new PathNode();
  const pathS = new PathNode();
  const pathR = new PathNode();
  const pathQ = new PathNode();

  const pnp = new GateNode('pnp');
  const npn = new GateNode('npn');

  const network = new Network(
    [pathVCC, pathS, pathR, pathQ],
    [pnp, npn],
    [pinVCC, pinS, pinR, pinQ],
  );

  pinVCC.connectedPaths.push(pathVCC);
  pinS.connectedPaths.push(pathS);
  pinR.connectedPaths.push(pathR);
  pinQ.connectedPaths.push(pathQ);

  npn.gatedPaths.push(pathVCC);
  npn.gatedPaths.push(pathQ);
  npn.switchingPaths.push(pathS);

  pnp.gatedPaths.push(pathS);
  pnp.gatedPaths.push(pathQ);
  pnp.switchingPaths.push(pathR);

  network.step();
  assertEqual(pinQ.state, false);

  // pinS active
  pinS.active = true;
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinQ.state, true);

  // pinS unactive but high path connected
  pinS.active = false;
  network.step();
  network.step();
  network.step();
  assertEqual(pinQ.state, true);
  assertEqual(pinS.state, true); // S should still be high, as its connected to VCC

  // pinR active
  pinR.active = true;
  network.step();
  assertEqual(pinS.state, true); // S is still high, should be low next step when pnp closes
  assertEqual(pinQ.state, true);

  // pinR unactive, S should now be low
  pinR.active = false;
  network.step();
  assertEqual(pinQ.state, true); // Q is still high, show be low next step when npn closes

  // npn should now be closed, Q should be low
  network.step();
  assertEqual(pinVCC.state, true);
  assertEqual(pinS.state, false);
  assertEqual(pinR.state, false);
  assertEqual(pinQ.state, false);

}
