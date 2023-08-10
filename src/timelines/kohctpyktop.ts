import { Network, Timeline } from "@/simulation";

type KOHCTPYKTOPLevelName = '01 KT411I QUAD INVERTER GATE';

type TimelineBuilder<T extends string|number|symbol> = Record<T, (network: Network) => Timeline>

const kohctpyktop: TimelineBuilder<KOHCTPYKTOPLevelName> = {

  '01 KT411I QUAD INVERTER GATE': (network) => {
    const pins = network.getPinNodes();
    const [
      pinVCC0, pinVCC1,
      pinA0, pinY0,
      pinA1, pinY1,
      pinA2, pinY2,
      pinA3, pinY3,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA0.label = 'A0';
    pinY0.label = 'Y0';
    pinA1.label = 'A1';
    pinY1.label = 'Y1';
    pinA2.label = 'A2';
    pinY2.label = 'Y2';
    pinA3.label = 'A3';
    pinY3.label = 'Y3';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    for (let i = 0; i < 14; i++) {
      tl.addPulse(i*20, 10, pinA0);
    }
    for (let i = 0; i < 9; i++) {
      tl.addPulse(i*30, 10, pinA1);
    }
    for (let i = 0; i < 6; i++) {
      tl.addPulse(i*40, 10, pinA2);
    }
    for (let i = 0; i < 5; i++) {
      tl.addPulse(i*50, 10, pinA3);
      tl.addPulse(i*50 + 20, 20, pinA3);
    }
    tl.addPulse(250, 20, pinA3);
    return tl;
  }

}

export { kohctpyktop };