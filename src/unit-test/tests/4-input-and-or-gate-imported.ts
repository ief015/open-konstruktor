import { assertEqual, assertPin } from "@/unit-test";
import { Network, Timeline } from "@/simulation";
import FieldGraph from "@/simulation/FieldGraph";

export default async function() {

  const saveString = 'eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ruVX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wGrvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiFospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==';
  const fieldGraph = FieldGraph.from(saveString);
  const network = Network.from(fieldGraph);

  const pins = network.getPinNodes();
  const paths = network.getPathNodes();
  const gates = network.getGateNodes();

  assertEqual(pins.length, 12, 'pins.length');
  assertEqual(paths.length, 18, 'paths.length');
  assertEqual(gates.length, 8, 'gates.length');

  const pinVCC = pins[0];
  const pinA = pins[2];
  const pinB = pins[4];
  const pinC = pins[6];
  const pinD = pins[8];
  const pinX = pins[5];
  const pinY = pins[7];

  assertEqual(!!pinVCC.path, true, 'pinVCC.path');
  assertEqual(!!pinA.path, true, 'pinA.path');
  assertEqual(!!pinB.path, true, 'pinB.path');
  assertEqual(!!pinC.path, true, 'pinC.path');
  assertEqual(!!pinD.path, true, 'pinD.path');
  assertEqual(!!pinX.path, true, 'pinX.path');
  assertEqual(!!pinY.path, true, 'pinY.path');

  assertEqual(gates.filter(g => g.gatedPaths.includes(paths[0])).length, 2, 'asd');

  for (const k in gates) {
    const gate = gates[k];
    assertEqual(gate.gatedPaths.length, 2, `gates[${k}].gatedPaths.length`);
    assertEqual(gate.switchingPaths.length, 1, `gate[${k}].switchingPaths.length`);
  }

  pinVCC.label = 'VCC';
  pinA.label = 'A';
  pinB.label = 'B';
  pinC.label = 'C';
  pinD.label = 'D';
  pinX.label = 'X';
  pinY.label = 'Y';

  const tl = new Timeline(network);

  tl.addKeyFrame(0, pinVCC, true);

  // Pin A
  for (let i = 0; i < 10; i++) {
    tl.addKeyFrame(i * 20 + 10, pinA, true);
    tl.addKeyFrame(i * 20 + 20, pinA, false);
  }
  tl.addKeyFrame(210, pinA, true);
  tl.addKeyFrame(240, pinA, false);
  tl.addKeyFrame(250, pinA, true);
  tl.addKeyFrame(270, pinA, false);

  // Pin B
  tl.addKeyFrame(20, pinB, true);
  tl.addKeyFrame(40, pinB, false);
  tl.addKeyFrame(60, pinB, true);
  tl.addKeyFrame(80, pinB, false);
  tl.addKeyFrame(90, pinB, true);
  tl.addKeyFrame(120, pinB, false);
  tl.addKeyFrame(140, pinB, true);
  tl.addKeyFrame(160, pinB, false);
  tl.addKeyFrame(190, pinB, true);
  tl.addKeyFrame(200, pinB, false);
  tl.addKeyFrame(220, pinB, true);
  tl.addKeyFrame(240, pinB, false);
  tl.addKeyFrame(260, pinB, true);
  tl.addKeyFrame(270, pinB, false);

  // Pin C
  tl.addKeyFrame(30, pinC, true);
  tl.addKeyFrame(80, pinC, false);
  tl.addKeyFrame(90, pinC, true);
  tl.addKeyFrame(100, pinC, false);
  tl.addKeyFrame(120, pinC, true);
  tl.addKeyFrame(160, pinC, false);
  tl.addKeyFrame(200, pinC, true);
  tl.addKeyFrame(240, pinC, false);
  tl.addKeyFrame(260, pinC, true);
  tl.addKeyFrame(270, pinC, false);

  // Pin D
  tl.addKeyFrame(30, pinD, true);
  tl.addKeyFrame(40, pinD, false);
  tl.addKeyFrame(80, pinD, true);
  tl.addKeyFrame(160, pinD, false);
  tl.addKeyFrame(200, pinD, true);
  tl.addKeyFrame(210, pinD, false);
  tl.addKeyFrame(220, pinD, true);
  tl.addKeyFrame(240, pinD, false);
  tl.addKeyFrame(250, pinD, true);
  tl.addKeyFrame(270, pinD, false);

  tl.run(280, frame => {
    // Probe various frames for expected values
    switch (frame) {
      case 0:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 1:
      case 10:
      case 11:
        assertPin(pinX, 0);
        assertPin(pinY, 0);
        break;
      case 12:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 30:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 31:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 30:
        assertPin(pinX, 0);
        assertPin(pinY, 0);
        break;
      case 90:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 91:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 100:
      case 119:
      case 120:
      case 149:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 150:
      case 159:
        assertPin(pinX, 1);
        assertPin(pinY, 1);
        break;
      case 160:
      case 161:
        assertPin(pinX, 0);
        assertPin(pinY, 1);
        break;
      case 162:
        assertPin(pinX, 0);
        assertPin(pinY, 0);
        break;
    }
  });

  //tl.printHistory();

}
