import { assertPin } from "..";
import { PathNode, GateNode, PinNode, Network, Timeline } from "../../simulation";

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


  const pinVCC = new PinNode('VCC', true);
  const pinA = new PinNode('A');
  const pinB = new PinNode('B');
  const pinY0 = new PinNode('Y0');
  const pinY1 = new PinNode('Y1');
  const pinY2 = new PinNode('Y2');
  const pinY3 = new PinNode('Y3');

  const p1 = new PathNode();
  const p2 = new PathNode();

  const gp1 = new GateNode('pnp');
  const gp2 = new GateNode('pnp');
  const gp3 = new GateNode('pnp');
  const gp4 = new GateNode('pnp');

  const gn1 = new GateNode('npn');
  const gn2 = new GateNode('npn');

  gp1.gatedPaths.push(pinVCC, p1);
  gp1.switchingPaths.push(pinA);

  gp2.gatedPaths.push(p1, pinY0);
  gp2.switchingPaths.push(pinB);

  gp3.gatedPaths.push(pinA, pinY1);
  gp3.switchingPaths.push(pinB);

  gp4.gatedPaths.push(pinVCC, p2);
  gp4.switchingPaths.push(pinA);

  gn1.gatedPaths.push(p2, pinY2);
  gn1.switchingPaths.push(pinB);

  gn2.gatedPaths.push(pinA, pinY3);
  gn2.switchingPaths.push(pinB);

  const network = new Network(
    [ pinVCC, pinA, pinB, pinY0, pinY1, pinY2, pinY3, p1, p2 ],
    [ gp1, gp2, gp3, gp4, gn1, gn2 ],
  );

  const tl = new Timeline(network);

  // Pin A
  for (let i = 0; i < 10; i++) {
    tl.addKeyFrame(i * 20 + 10, pinA, true);
    tl.addKeyFrame(i * 20 + 20, pinA, false);
  }
  tl.addKeyFrame(210, pinA, true);
  tl.addKeyFrame(240, pinA, false);
  tl.addKeyFrame(250, pinA, true);
  tl.addKeyFrame(260, pinA, false);

  // Pin B
  for (let i = 0; i < 4; i++) {
    tl.addKeyFrame(i * 40 + 20, pinB, true);
    tl.addKeyFrame(i * 40 + 40, pinB, false);
  }
  tl.addKeyFrame(190, pinB, true);
  tl.addKeyFrame(200, pinB, false);
  tl.addKeyFrame(220, pinB, true);
  tl.addKeyFrame(240, pinB, false);
  tl.addKeyFrame(260, pinB, true);
  tl.addKeyFrame(270, pinB, false);

  tl.run(280, frame => {
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
