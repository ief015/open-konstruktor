import { Network, Timeline } from "@/simulation";

type KOHCTPYKTOPLevelName =
  '01 KT411I QUAD INVERTER GATE' |
  '02 KT221A DUAL 2-INPUT AND GATE' |
  '03 KT141AO 4-INPUT AND-OR GATE' |
  // '04 KO229 POWER ON RESET GENERATOR' |
  // '05 KO223 DUAL FIXED FREQUENCY OSCILLATOR' |
  // '06 KL2S1 DUAL SET-RESET LATCH' |
  // '07 KL2T1 DUAL TOGGLE LATCH' |
  // '08 KO224X DUAL FREQUENCY OSCILLATOR' |
  // '09 KD124 2-TO-4 LINE DECODER' |
  // '10 KA180 2-BIT ADDER WITH CARRY' |
  // '11 KC82F DIVIDE-BY-FOUR COUNTER' |
  // '12 KM141P 4-TO-1 MULTIPLEXER' |
  // '13 KC84C 4-BIT COUNTER WITH CLEAR' |
  // '14 KC74S 4-BIT SHIFT REGISTER S-TO-P'
  '15 KR8S1 8-BIT ADDRESSABLE SRAM';
  // '16 KA181 2-BIT LOGICAL FUNCTION UNIT' |
  // '17 X901 RADIO MESSAGE STREAM DECODER' |
  // '18 X902 GRENADE LAUNCHER AMMO COUNTER' |
  // '19 X903 GATLING CANNON FIRE CONTROLLER';

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

  '03 KT141AO 4-INPUT AND-OR GATE': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA, pinNC0,
      pinB, pinX,
      pinC, pinY,
      pinD, pinNC1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    pinA.label = 'A';
    pinB.label = 'B';
    pinC.label = 'C';
    pinD.label = 'D';
    pinX.label = 'X';
    pinY.label = 'Y';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A
    for (let i = 0; i < 10; i++) {
      tl.addPulse(i*20 + 10, 10, pinA);
    }
    tl.addPulse(210, 30, pinA);
    tl.addPulse(250, 20, pinA);
    // B
    tl.addPulse(20, 20, pinB);
    tl.addPulse(60, 20, pinB);
    tl.addPulse(90, 30, pinB);
    tl.addPulse(140, 20, pinB);
    tl.addPulse(190, 10, pinB);
    tl.addPulse(220, 20, pinB);
    tl.addPulse(260, 10, pinB);
    // C
    tl.addPulse(30, 50, pinC);
    tl.addPulse(90, 10, pinC);
    tl.addPulse(120, 40, pinC);
    tl.addPulse(200, 40, pinC);
    tl.addPulse(260, 10, pinC);
    // D
    tl.addPulse(30, 10, pinD);
    tl.addPulse(80, 80, pinD);
    tl.addPulse(200, 10, pinD);
    tl.addPulse(220, 20, pinD);
    tl.addPulse(250, 20, pinD);
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