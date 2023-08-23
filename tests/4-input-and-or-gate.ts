import { test } from "vitest";
import { assertPin } from "@/utils/assert";
import { PathNode, GateNode, PinNode, Network, CircuitSimulation, Sequence } from "@/simulation";

// Based on KT141AO - 4-INPUT AND/OR GATE design:
/*
eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ru
VX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wG
rvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/
Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiF
ospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6
mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==
*/

test('4-input-and-or-gate', () => {

  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathB = new PathNode();
  const pathC = new PathNode();
  const pathD = new PathNode();
  const pathX = new PathNode();
  const pathY = new PathNode();

  const pinVCC = new PinNode(pathVCC, 'VCC', true);
  const pinA = new PinNode(pathA, 'A');
  const pinB = new PinNode(pathB, 'B');
  const pinC = new PinNode(pathC, 'C');
  const pinD = new PinNode(pathD, 'D');
  const pinX = new PinNode(pathX, 'X');
  const pinY = new PinNode(pathY, 'Y');

  const gp1 = new GateNode('pnp');
  const gp2 = new GateNode('pnp');
  const gp3 = new GateNode('pnp');
  const gp4 = new GateNode('pnp');
  const gp5 = new GateNode('pnp');

  const pp1 = new PathNode();
  const pp2 = new PathNode();
  const pp3 = new PathNode();
  const pp4 = new PathNode();

  const gn1 = new GateNode('npn');
  const gn2 = new GateNode('npn');
  const gn3 = new GateNode('npn');

  const pn1 = new PathNode();
  const pn2 = new PathNode();

  gn1.gatedPaths.push(pathA, pn1);
  gn1.switchingPaths.push(pathB);

  gn2.gatedPaths.push(pn1, pn2);
  gn2.switchingPaths.push(pathC);

  gn3.gatedPaths.push(pn2, pathX);
  gn3.switchingPaths.push(pathD);

  gp1.gatedPaths.push(pathVCC, pp1);
  gp1.switchingPaths.push(pathA);
  
  gp2.gatedPaths.push(pp1, pp2);
  gp2.switchingPaths.push(pathB);
  
  gp3.gatedPaths.push(pp2, pp3);
  gp3.switchingPaths.push(pathC);
  
  gp4.gatedPaths.push(pp3, pp4);
  gp4.switchingPaths.push(pathD);

  gp5.gatedPaths.push(pathVCC, pathY);
  gp5.switchingPaths.push(pp4);

  const network = new Network([
    pinVCC, pinA, pinB, pinC, pinD, pinX, pinY,
    pathVCC, pathA, pathB, pathC, pathD, pathX, pathY,
    pp1, pp2, pp3, pp4, pn1, pn2,
    gp1, gp2, gp3, gp4, gp5, gn1, gn2, gn3
  ]);

  const sim = new CircuitSimulation(network);

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

  // tl.printHistory();

});
