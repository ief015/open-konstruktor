import { assertEqual } from "@/unit-test";
import { GateNode, PinNode, Network } from "@/simulation";

export default async function() {

  const pinVCC = new PinNode(true);
  const pinS = new PinNode();
  const pinR = new PinNode();
  const pinQ = new PinNode();

  const pnp = new GateNode('pnp');
  const npn = new GateNode('npn');

  const network = new Network([
    pinVCC, pinS, pinR, pinQ,
    pnp, npn,
  ]);

  npn.gatedPaths.push(pinVCC);
  npn.gatedPaths.push(pinQ);
  npn.switchingPaths.push(pinS);

  pnp.gatedPaths.push(pinS);
  pnp.gatedPaths.push(pinQ);
  pnp.switchingPaths.push(pinR);

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
