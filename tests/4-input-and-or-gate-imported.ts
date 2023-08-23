import { test } from "vitest";
import { assertEqual, assertPin } from "@/utils/assert";
import { Network, FieldGraph, CircuitSimulation, Sequence } from "@/simulation";

test('4-input-and-or-gate-imported', () => {

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

  const sim = new CircuitSimulation(network);

  pinVCC.active = true;

  // Pin A
  const seqA = new Sequence();
  for (let i = 0; i < 10; i++) {
    seqA.setFrame(i * 20 + 10, true);
    seqA.setFrame(i * 20 + 20, false);
  }
  seqA.setFrame(210, true);
  seqA.setFrame(240, false);
  seqA.setFrame(250, true);
  seqA.setFrame(270, false);
  sim.setInputSequence(pinA, seqA);

  // Pin B
  const seqB = new Sequence()
    .setFrame(20, true)
    .setFrame(40, false)
    .setFrame(60, true)
    .setFrame(80, false)
    .setFrame(90, true)
    .setFrame(120, false)
    .setFrame(140, true)
    .setFrame(160, false)
    .setFrame(190, true)
    .setFrame(200, false)
    .setFrame(220, true)
    .setFrame(240, false)
    .setFrame(260, true)
    .setFrame(270, false);
  sim.setInputSequence(pinB, seqB);

  // Pin C
  const seqC = new Sequence()
    .setFrame(30, true)
    .setFrame(80, false)
    .setFrame(90, true)
    .setFrame(100, false)
    .setFrame(120, true)
    .setFrame(160, false)
    .setFrame(200, true)
    .setFrame(240, false)
    .setFrame(260, true)
    .setFrame(270, false);
  sim.setInputSequence(pinC, seqC);

  // Pin D
  const seqD = new Sequence()
    .setFrame(30, true)
    .setFrame(40, false)
    .setFrame(80, true)
    .setFrame(160, false)
    .setFrame(200, true)
    .setFrame(210, false)
    .setFrame(220, true)
    .setFrame(240, false)
    .setFrame(250, true)
    .setFrame(270, false);
  sim.setInputSequence(pinD, seqD);

  sim.run(280, frame => {
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

});
