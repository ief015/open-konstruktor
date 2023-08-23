import { test } from "vitest";
import { assertEqual, assertPin } from "@/utils/assert";
import { GateNode, PinNode, Network, PathNode, CircuitSimulation, Sequence } from "@/simulation";


test('npn', () => {

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

});


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


test('sr-latch', () => {

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

});


test('dual-fixed-freq-oscillator', () => {

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

});


test('4-input-and-or-gate', () => {

  // Based on KT141AO - 4-INPUT AND/OR GATE design:
  /*
  eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ru
  VX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wG
  rvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/
  Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiF
  ospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6
  mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==
  */

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

});


test('2-to-4 line decoder', () => {

  // Based on KD124 - 2-TO-4 LINE DECODER design:
  /*
  eNrtmUESgyAMRYW48Qy9Qvc9S+9/kVYUxQxELVYifhlHpo9IGsMHpX22j+5tupdp
  m18KDGF4tKFh142GlpW6o2r2Gq6ER2MCNL8kwFDb7aphpd7Msfsfh5HCA5WDIQwV
  GbrlnE0fjhJR9MynXz70Q3N17jeTts0K9iWj997cdZRuYJN8PEYXSOy+GKUjaZh7
  qTb+iNJpQuobDnehqdEylf39S9Dhb8SoBQ1/DJ42p8tciFHf4iSpSknkJg0FBQUF
  vTeFVJahiSWsAp+pUDT0eWUv6hUopLIeMSQ+1HQMcO7WSWLovg4IssPcUhWrqYKx
  AKkExboR60ZkO6QSASlAF5+xFck7c+u0aMi2zC1VsSJCPkMqJ3O1m99Xp3fYDRdp
  oJUCtYX3uIWhhD3uVUohjlJazpixHXD2oeM/e9yHSGX8zKf3m7P4cvLeMziiUT/l
  y+/UW4N0Z/5OUUCRPmbMyDY=
  */

  const pathVCC = new PathNode();
  const pathA = new PathNode();
  const pathB = new PathNode();
  const pathY0 = new PathNode();
  const pathY1 = new PathNode();
  const pathY2 = new PathNode();
  const pathY3 = new PathNode();

  const pinVCC = new PinNode(pathVCC, 'VCC', true);
  const pinA = new PinNode(pathA, 'A');
  const pinB = new PinNode(pathB, 'B');
  const pinY0 = new PinNode(pathY0, 'Y0');
  const pinY1 = new PinNode(pathY1, 'Y1');
  const pinY2 = new PinNode(pathY2, 'Y2');
  const pinY3 = new PinNode(pathY3, 'Y3');

  const p1 = new PathNode();
  const p2 = new PathNode();

  const gp1 = new GateNode('pnp');
  const gp2 = new GateNode('pnp');
  const gp3 = new GateNode('pnp');
  const gp4 = new GateNode('pnp');

  const gn1 = new GateNode('npn');
  const gn2 = new GateNode('npn');

  gp1.gatedPaths.push(pathVCC, p1);
  gp1.switchingPaths.push(pathA);

  gp2.gatedPaths.push(p1, pathY0);
  gp2.switchingPaths.push(pathB);

  gp3.gatedPaths.push(pathA, pathY1);
  gp3.switchingPaths.push(pathB);

  gp4.gatedPaths.push(pathVCC, p2);
  gp4.switchingPaths.push(pathA);

  gn1.gatedPaths.push(p2, pathY2);
  gn1.switchingPaths.push(pathB);

  gn2.gatedPaths.push(pathA, pathY3);
  gn2.switchingPaths.push(pathB);

  const network = new Network([
    pinVCC, pinA, pinB, pinY0, pinY1, pinY2, pinY3,
    pathVCC, pathA, pathB, pathY0, pathY1, pathY2, pathY3, p1, p2,
    gp1, gp2, gp3, gp4, gn1, gn2,
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
  seqA.setFrame(260, false);
  sim.setInputSequence(pinA, seqA);

  // Pin B
  const seqB = new Sequence();
  for (let i = 0; i < 4; i++) {
    seqB.setFrame(i * 40 + 20, true);
    seqB.setFrame(i * 40 + 40, false);
  }
  seqB.setFrame(190, true);
  seqB.setFrame(200, false);
  seqB.setFrame(220, true);
  seqB.setFrame(240, false);
  seqB.setFrame(260, true);
  seqB.setFrame(270, false);
  sim.setInputSequence(pinB, seqB);

  sim.run(280, frame => {
    // Probe various frames for expected values
    switch (frame) {
      case 0:
        assertPin(pinY0, 1);
        assertPin(pinY1, 0);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 10:
        assertPin(pinY0, 1);
        assertPin(pinY1, 1);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 11:
        assertPin(pinY0, 0);
        assertPin(pinY1, 1);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 20:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 21:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 1);
        assertPin(pinY3, 0);
        break;
      case 30:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 1);
        assertPin(pinY3, 1);
        break;
      case 31:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 0);
        assertPin(pinY3, 1);
        break;
      case 190:
        assertPin(pinY0, 1);
        assertPin(pinY1, 1);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 191:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 0);
        assertPin(pinY3, 1);
        break;
      case 250:
        assertPin(pinY0, 1);
        assertPin(pinY1, 1);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 251:
        assertPin(pinY0, 0);
        assertPin(pinY1, 1);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
      case 270:
        assertPin(pinY0, 0);
        assertPin(pinY1, 0);
        assertPin(pinY2, 1);
        assertPin(pinY3, 0);
        break;
      case 279:
        assertPin(pinY0, 1);
        assertPin(pinY1, 0);
        assertPin(pinY2, 0);
        assertPin(pinY3, 0);
        break;
    }
  });

});
