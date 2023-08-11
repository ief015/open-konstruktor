import { Network, Timeline } from "@/simulation";

type KOHCTPYKTOPLevelName =
  '01 KT411I QUAD INVERTER GATE' |
  '02 KT221A DUAL 2-INPUT AND GATE' |
  '15 KR8S1 8-BIT ADDRESSABLE SRAM';

type TimelineBuilder<T extends string|number|symbol> = Record<T, (network: Network) => Timeline>

const kohctpyktop: TimelineBuilder<KOHCTPYKTOPLevelName> = {

  '01 KT411I QUAD INVERTER GATE': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
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
    for (let i = 0; i < 7; i++) {
      tl.addPulse(i*40, 10, pinA2);
    }
    for (let i = 0; i < 5; i++) {
      tl.addPulse(i*50, 10, pinA3);
      tl.addPulse(i*50 + 20, 20, pinA3);
    }
    tl.addPulse(250, 20, pinA3);
    return tl;
  },

  '02 KT221A DUAL 2-INPUT AND GATE': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA0, pinNC0,
      pinB0, pinA1,
      pinY0, pinB1,
      pinNC1, pinY1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA0.label = 'A0';
    pinA1.label = 'A1';
    pinY0.label = 'Y0';
    pinY1.label = 'Y1';
    pinB0.label = 'B0';
    pinB1.label = 'B1';
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    for (let i = 0; i < 13; i++) {
      tl.addPulse(i*20 + 10, 10, pinA0);
    }
    for (let i = 0; i < 6; i++) {
      tl.addPulse(i*40 + 20, 20, pinB0);
    }
    tl.addPulse(260, 10, pinB0);
    for (let i = 0; i < 9; i++) {
      tl.addPulse(i*30 + 10, 20, pinA1);
    }
    for (let i = 0; i < 5; i++) {
      tl.addPulse(i*50 + 20, 10, pinB1);
    }
    return tl;
  },

  '15 KR8S1 8-BIT ADDRESSABLE SRAM': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA0, pinRW,
      pinA1, pinCLK,
      pinA2, pinDin,
      pinNC0, pinDout,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA0.label = 'A0';
    pinRW.label = 'R/W';
    pinA1.label = 'A1';
    pinCLK.label = 'CLK';
    pinA2.label = 'A2';
    pinDin.label = 'Din';
    pinNC0.label = 'N/C';
    pinDout.label = 'Dout';
    const tl = new Timeline(network);
    // A0
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    tl.addPulse(20, 10, pinA0);
    tl.addPulse(50, 20, pinA0);
    tl.addPulse(80, 20, pinA0);
    tl.addPulse(110, 10, pinA0);
    for (let i = 0; i < 7; i++) {
      tl.addPulse(i*20 + 140, 10, pinA0);
    }
    // A1
    tl.addPulse(30, 40, pinA1);
    tl.addPulse(100, 20, pinA1);
    tl.addPulse(150, 20, pinA1);
    tl.addPulse(190, 20, pinA1);
    tl.addPulse(220, 10, pinA1);
    tl.addPulse(240, 10, pinA1);
    tl.addPulse(260, 10, pinA1);
    // A2
    tl.addPulse(70, 50, pinA2);
    tl.addPulse(170, 40, pinA2);
    tl.addPulse(220, 10, pinA2);
    tl.addPulse(240, 10, pinA2);
    tl.addPulse(260, 10, pinA2);
    // R/W
    tl.addPulse(0, 130, pinRW);
    tl.addPulse(240, 10, pinRW);
    // CLK
    for (let i = 0; i < 11; i++) {
      tl.addPulse(i*10 + 10, 5, pinCLK);
    }
    tl.addPulse(130, 100, pinCLK);
    tl.addPulse(240, 5, pinCLK);
    tl.addPulse(260, 10, pinCLK);
    // Din
    tl.addPulse(10, 10, pinDin);
    tl.addPulse(40, 20, pinDin);
    tl.addPulse(80, 10, pinDin);
    tl.addPulse(110, 10, pinDin);
    return tl;
  }

}

export { kohctpyktop };