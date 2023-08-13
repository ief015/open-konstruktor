import { assertPin } from "@/unit-test";
import { PathNode, GateNode, PinNode, Network, CircuitSimulation, Sequence } from "@/simulation";

// Based on KO223 - DUAL FIXED FREQUENCY OSCILLATOR design:
/*
eNrtmkEOwiAQRdv5bHoGr+Des3j/iygkTbTC0EAxDHyaLszLyyjYz9jq7u62Pdft
sbql5DAsruEoqijDTw5Fin8VpUw8fRH/iqzIiqzYS0WfAFK6sVZs5QPmamjnJD0C
BRA966kf4fU+vur64Rak3pZtLHCLisUWDZ9GxR/LG8Hv6VK4n011QvO60O7JDqup
4pydDo62gRUPylNJSkpKSjo37SEqwYWYloLuzC4MJUMHURltwxmkk4Qh6A7sIvfd
QEUysKtk7MwTlfqlBLrGXVt9Y/9dJaNyWgrQndgFDCVD8wfkx60D1/acpLYp6I7s
IkfVbjadG22ecV8SlfGznu67x/EfAezBxvkBXnOXTOjadqXiTqaSDK0TKTJeEfjH
pA==
*/

export default async function() {

  const pathVCC = new PathNode();
  const pathEn0 = new PathNode();
  const pathOsc0 = new PathNode();
  const pathEn1 = new PathNode();
  const pathOsc1 = new PathNode();

  const pinVCC = new PinNode(pathVCC, 'VCC', true);
  const pinEn0 = new PinNode(pathEn0, 'EN0');
  const pinOsc0 = new PinNode(pathOsc0, 'OSC0');
  const pinEn1 = new PinNode(pathEn1, 'EN1');
  const pinOsc1 = new PinNode(pathOsc1, 'OSC1');

  const npnEn0 = new GateNode('npn');
  const npnEn1 = new GateNode('npn');

  const pnpOsc = new GateNode('pnp');

  const npnOscGates: GateNode[] = [];
  const npnOscPaths: PathNode[] = [];

  const pathOsc = new PathNode();
  const pathPnp = new PathNode();

  for (let i = 0; i < 9; i++) {
    const cur = new GateNode('npn');
    cur.gatedPaths.push(pathVCC);
    const prev = npnOscGates[npnOscGates.length - 1];
    npnOscGates.push(cur);
    if (prev) {
      const path = new PathNode();
      cur.gatedPaths.push(path);
      prev.switchingPaths.push(path);
      npnOscPaths.push(path);
    }
  }

  npnOscGates[0].gatedPaths.push(pathPnp);
  npnOscGates[npnOscGates.length - 1].switchingPaths.push(pathOsc);

  npnEn0.gatedPaths.push(pathEn0, pathOsc0);
  npnEn0.switchingPaths.push(pathOsc);
  npnEn1.gatedPaths.push(pathEn1, pathOsc1);
  npnEn1.switchingPaths.push(pathOsc);

  pnpOsc.gatedPaths.push(pathVCC, pathOsc);
  pnpOsc.switchingPaths.push(pathPnp);


  const network = new Network([
    pinVCC, pinEn0, pinOsc0, pinEn1, pinOsc1,
    pathVCC, pathEn0, pathOsc0, pathEn1, pathOsc1,
    npnEn0, npnEn1, pnpOsc, pathPnp, pathOsc,
    ...npnOscGates,
    ...npnOscPaths
  ]);

  const sim = new CircuitSimulation(network);

  // Pin En0
  const seqEn0 = new Sequence()
    .setFrame(40, true)
    .setFrame(140, false)
    .setFrame(180, true)
    .setFrame(250, false);
  sim.setInputSequence(pinEn0, seqEn0);

  // Pin En1
  const seqEn1 = new Sequence()
    .setFrame(20, true)
    .setFrame(80, false)
    .setFrame(120, true)
    .setFrame(160, false)
    .setFrame(200, true)
    .setFrame(250, false);
  sim.setInputSequence(pinEn1, seqEn1);

  sim.run(280, frame => {
    // Probe various frames for expected values
    switch (frame) {
      case 20:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 0);
        break;
      case 21:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 1);
        break;
      case 30:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 1);
        break;
      case 31:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 0);
        break;
      case 40:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 0);
        break;
      case 41:
        assertPin(pinOsc0, 1);
        assertPin(pinOsc1, 1);
        break;
      case 200:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 0);
        break;
      case 201:
        assertPin(pinOsc0, 1);
        assertPin(pinOsc1, 1);
        break;
      case 249:
        assertPin(pinOsc0, 1);
        assertPin(pinOsc1, 1);
        break;
      case 250:
        assertPin(pinOsc0, 0);
        assertPin(pinOsc1, 0);
        break;
    }
  });

  // tl.printHistory();

}
