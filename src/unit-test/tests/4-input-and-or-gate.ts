import { assertPin } from "..";
import { PathNode, GateNode, PinNode, Network, Timeline } from "../../simulation";

// Based on KT141AO - 4-INPUT AND/OR GATE design:
/*
eNrtmkEOgjAQRWU+G87gFdx7Fu9/EZMKgkCnhQoRfDRdmNcfkJCXKUN9q6/No2ru
VX1ZMwguDloYi4PVeywK2sfYIzi8VFt7V/cP8qwSJEiQIMFjB0M5Z/EjUEmzs5wG
rvDbutmf1wYLErRdMU+n/6inFqPmZhP0tcKn8qhBodAY3dJIMRNmqRIaoeJuQKH/
Qc+uynHltyCrgiwUCkWVB5KhJqXfcAOePq9ckYqKFApFlaevG+Ury3+TmaE7ZAiF
ospjUHcTLbcyVHoDLh4tKBRV9vHCHrd1Xax4F9tcqrGacoWW0eO2gh63XzcqoVn6
mFDoOrpNj/srqpyf5bT1pPzLTihr/EnQj9R+4l0lFLoJ3dJIkeMJ5zrHaQ==
*/

export default async function() {

  const pinVCC = new PinNode('VCC', true);
  const pinA = new PinNode('A');
  const pinB = new PinNode('B');
  const pinC = new PinNode('C');
  const pinD = new PinNode('D');
  const pinX = new PinNode('X');
  const pinY = new PinNode('Y');

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

  gn1.gatedPaths.push(pinA, pn1);
  gn1.switchingPaths.push(pinB);

  gn2.gatedPaths.push(pn1, pn2);
  gn2.switchingPaths.push(pinC);

  gn3.gatedPaths.push(pn2, pinX);
  gn3.switchingPaths.push(pinD);

  gp1.gatedPaths.push(pinVCC, pp1);
  gp1.switchingPaths.push(pinA);
  
  gp2.gatedPaths.push(pp1, pp2);
  gp2.switchingPaths.push(pinB);
  
  gp3.gatedPaths.push(pp2, pp3);
  gp3.switchingPaths.push(pinC);
  
  gp4.gatedPaths.push(pp3, pp4);
  gp4.switchingPaths.push(pinD);

  gp5.gatedPaths.push(pinVCC, pinY);
  gp5.switchingPaths.push(pp4);

  const network = new Network([
    pinVCC, pinA, pinB, pinC, pinD, pinX, pinY,
    pp1, pp2, pp3, pp4, pn1, pn2,
    gp1, gp2, gp3, gp4, gp5, gn1, gn2, gn3
  ]);

  const tl = new Timeline(network);

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
        assertPin(pinX, 0);
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

}
