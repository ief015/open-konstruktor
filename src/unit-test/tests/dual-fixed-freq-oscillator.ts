import { assertPin } from "..";
import { PathNode, GateNode, PinNode, Network, Timeline } from "../../simulation";
import pnp from "./pnp";

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

  const pinVCC = new PinNode('VCC', true);
  const pinEn0 = new PinNode('EN0');
  const pinOsc0 = new PinNode('OSC0');
  const pinEn1 = new PinNode('EN1');
  const pinOsc1 = new PinNode('OSC1');

  const npnEn0 = new GateNode('npn');
  const npnEn1 = new GateNode('npn');

  const pnpOsc = new GateNode('pnp');

  const npnOscGates: GateNode[] = [];
  const npnOscPaths: PathNode[] = [];

  const pathOsc = new PathNode();
  const pathPnp = new PathNode();

  for (let i = 0; i < 9; i++) {
    const cur = new GateNode('npn');
    cur.gatedPaths.push(pinVCC);
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

  npnEn0.gatedPaths.push(pinEn0, pinOsc0);
  npnEn0.switchingPaths.push(pathOsc);
  npnEn1.gatedPaths.push(pinEn1, pinOsc1);
  npnEn1.switchingPaths.push(pathOsc);

  pnpOsc.gatedPaths.push(pinVCC, pathOsc);
  pnpOsc.switchingPaths.push(pathPnp);


  const network = new Network([
    pinVCC, pinEn0, pinOsc0, pinEn1, pinOsc1,
    npnEn0, npnEn1, pnpOsc, pathPnp, pathOsc,
    ...npnOscGates,
    ...npnOscPaths
  ]);

  const tl = new Timeline(network);

  // Pin En0
  tl.addKeyFrame(40, pinEn0, true);
  tl.addKeyFrame(140, pinEn0, false);
  tl.addKeyFrame(180, pinEn0, true);
  tl.addKeyFrame(250, pinEn0, false);

  // Pin En1
  tl.addKeyFrame(20, pinEn1, true);
  tl.addKeyFrame(80, pinEn1, false);
  tl.addKeyFrame(120, pinEn1, true);
  tl.addKeyFrame(160, pinEn1, false);
  tl.addKeyFrame(200, pinEn1, true);
  tl.addKeyFrame(250, pinEn1, false);

  tl.run(280, frame => {
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
