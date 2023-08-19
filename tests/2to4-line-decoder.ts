import { PathNode, GateNode, PinNode, Network, CircuitSimulation, Sequence } from "@/simulation";
import { assertEqual, assertEqualArray, assertPin } from "@/utils/assert";

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

export default async function() {

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

  // tl.printHistory();

}
