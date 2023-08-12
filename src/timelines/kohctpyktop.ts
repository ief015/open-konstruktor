import { Network, Timeline } from "@/simulation";

type KOHCTPYKTOPLevelName =
  '01 KT411I QUAD INVERTER GATE' |
  '02 KT221A DUAL 2-INPUT AND GATE' |
  '03 KT141AO 4-INPUT AND-OR GATE' |
  '04 KO229 POWER ON RESET GENERATOR' |
  '05 KO223 DUAL FIXED FREQUENCY OSCILLATOR' |
  '06 KL2S1 DUAL SET-RESET LATCH' |
  '07 KL2T1 DUAL TOGGLE LATCH' |
  '08 KO224X DUAL FREQUENCY OSCILLATOR' |
  '09 KD124 2-TO-4 LINE DECODER' |
  '10 KA180 2-BIT ADDER WITH CARRY' |
  '11 KC82F DIVIDE-BY-FOUR COUNTER' |
  '12 KM141P 4-TO-1 MULTIPLEXER' |
  '13 KC84C 4-BIT COUNTER WITH CLEAR' |
  '14 KC74S 4-BIT SHIFT REGISTER S-TO-P' |
  '15 KR8S1 8-BIT ADDRESSABLE SRAM' |
  '16 KA181 2-BIT LOGICAL FUNCTION UNIT' |
  '17 X901 RADIO MESSAGE STREAM DECODER' |
  '18 X902 GRENADE LAUNCHER AMMO COUNTER' |
  '19 X903 GATLING CANNON FIRE CONTROLLER';


/*

  'LEVEL_NAME': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinNC1,
      pinNC2, pinNC3,
      pinNC4, pinNC5,
      pinNC6, pinNC7,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    pinNC2.label = 'N/C';
    pinNC3.label = 'N/C';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinNC6.label = 'N/C';
    pinNC7.label = 'N/C';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // tl.addPulse(10, 10, pinNC0);
    return tl;
  },

*/

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

  '04 KO229 POWER ON RESET GENERATOR': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinNC1,
      pinNC2, pinRST,
      pinNC4, pinRRST,
      pinNC6, pinNC7,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    pinNC2.label = 'N/C';
    pinRST.label = 'RST';
    pinNC4.label = 'N/C';
    pinRRST.label = '/RST';
    pinNC6.label = 'N/C';
    pinNC7.label = 'N/C';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    return tl;
  },

  '05 KO223 DUAL FIXED FREQUENCY OSCILLATOR': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinEN0, pinEN1,
      pinNC2, pinNC3,
      pinNC4, pinNC5,
      pinOSC0, pinOSC1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinEN0.label = 'EN0';
    pinEN1.label = 'EN1';
    pinNC2.label = 'N/C';
    pinNC3.label = 'N/C';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinOSC0.label = 'OSC0';
    pinOSC1.label = 'OSC1';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // EN0
    tl.addPulse(40, 100, pinEN0);
    tl.addPulse(180, 70, pinEN0);
    // EN1
    tl.addPulse(20, 60, pinEN1);
    tl.addPulse(120, 40, pinEN1);
    tl.addPulse(200, 50, pinEN1);
    return tl;
  },

  '06 KL2S1 DUAL SET-RESET LATCH': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinS0, pinS1,
      pinR0, pinR1,
      pinNC4, pinNC5,
      pinQ0, pinQ1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinS0.label = 'S0';
    pinS1.label = 'S1';
    pinR0.label = 'R0';
    pinR1.label = 'R1';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinQ0.label = 'Q0';
    pinQ1.label = 'Q1';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // S0
    tl.addPulse(10, 10, pinS0);
    tl.addPulse(100, 10, pinS0);
    tl.addPulse(170, 10, pinS0);
    // R0
    tl.addPulse(40, 10, pinR0);
    tl.addPulse(120, 10, pinR0);
    tl.addPulse(250, 10, pinR0);
    // S1
    tl.addPulse(20, 10, pinS1);
    tl.addPulse(60, 10, pinS1);
    tl.addPulse(140, 10, pinS1);
    tl.addPulse(240, 10, pinS1);
    // R1
    tl.addPulse(50, 10, pinR1);
    tl.addPulse(110, 10, pinR1);
    tl.addPulse(220, 10, pinR1);
    tl.addPulse(260, 10, pinR1);
    return tl;
  },

  '07 KL2T1 DUAL TOGGLE LATCH': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinT0, pinT1,
      pinNC2, pinNC3,
      pinNC4, pinNC5,
      pinQ0, pinQ1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinT0.label = 'T0';
    pinT1.label = 'T1';
    pinNC2.label = 'N/C';
    pinNC3.label = 'N/C';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinQ0.label = 'Q0';
    pinQ1.label = 'Q0';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // T0
    tl.addPulse(10, 5, pinT0);
    tl.addPulse(40, 5, pinT0);
    tl.addPulse(100, 5, pinT0);
    tl.addPulse(120, 5, pinT0);
    tl.addPulse(170, 5, pinT0);
    tl.addPulse(250, 5, pinT0);
    // T1
    tl.addPulse(20, 5, pinT1);
    tl.addPulse(30, 5, pinT1);
    tl.addPulse(60, 5, pinT1);
    tl.addPulse(110, 5, pinT1);
    tl.addPulse(140, 5, pinT1);
    tl.addPulse(220, 5, pinT1);
    tl.addPulse(240, 5, pinT1);
    tl.addPulse(260, 5, pinT1);
    return tl;
  },

  '08 KO224X DUAL FREQUENCY OSCILLATOR': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinS0, pinS1,
      pinNC2, pinNC3,
      pinNC4, pinNC5,
      pinOSC0, pinOSC1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinS0.label = 'S0';
    pinS1.label = 'S1';
    pinNC2.label = 'N/C';
    pinNC3.label = 'N/C';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinOSC0.label = 'OSC0';
    pinOSC1.label = 'OSC1';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    tl.addPulseRange(40, 140, pinS0);
    tl.addPulseRange(180, 260, pinS0);
    tl.addPulseRange(20, 80, pinS1);
    tl.addPulseRange(120, 160, pinS1);
    tl.addPulseRange(200, 240, pinS1);
    return tl;
  },

  '09 KD124 2-TO-4 LINE DECODER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinY0,
      pinA, pinY1,
      pinB, pinY2,
      pinNC6, pinY3,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinY0.label = 'Y0';
    pinA.label = 'A';
    pinY1.label = 'Y1';
    pinB.label = 'B';
    pinY2.label = 'Y2';
    pinNC6.label = 'N/C';
    pinY3.label = 'Y3';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    for (let i = 0; i < 10; i++) {
      tl.addPulse(i*20 + 10, 10, pinA);
    }
    tl.addPulseRange(210, 240, pinA);
    tl.addPulse(250, 10, pinA);
    for (let i = 0; i < 4; i++) {
      tl.addPulse(i*40 + 20, 20, pinB);
    }
    tl.addPulse(190, 10, pinB);
    tl.addPulse(220, 20, pinB);
    tl.addPulse(260, 10, pinB);
    return tl;
  },

  '10 KA180 2-BIT ADDER WITH CARRY': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA0, pinS0,
      pinA1, pinS1,
      pinB0, pinNC5,
      pinB1, pinC,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA0.label = 'A0';
    pinS0.label = 'S0';
    pinA1.label = 'A1';
    pinS1.label = 'S1';
    pinB0.label = 'B0';
    pinNC5.label = 'N/C';
    pinB1.label = 'B1';
    pinC.label = 'C';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A0
    tl.addOscillation(10, 10, 10, 10, pinA0);
    tl.addPulse(210, 30, pinA0);
    tl.addPulse(250, 10, pinA0);
    // A1
    tl.addOscillation(20, 4, 20, 20, pinA1);
    tl.addPulse(190, 10, pinA1);
    tl.addPulse(220, 20, pinA1);
    tl.addPulse(260, 10, pinA1);
    // B0
    tl.addOscillation(40, 3, 40, 40, pinB0);
    // B1
    tl.addPulseRange(80, 160, pinB1);
    tl.addPulse(200, 10, pinB1);
    tl.addPulse(220, 10, pinB1);
    tl.addPulse(250, 20, pinB1);
    return tl;
  },

  '11 KC82F DIVIDE-BY-FOUR COUNTER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinNC1,
      pinIN, pinOUT,
      pinNC4, pinNC5,
      pinNC6, pinNC7,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    pinIN.label = 'IN';
    pinOUT.label = 'OUT';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinNC6.label = 'N/C';
    pinNC7.label = 'N/C';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    tl.addOscillation(10, 8, 5, 5, pinIN);
    tl.addOscillation(120, 2, 5, 5, pinIN);
    tl.addOscillation(160, 2, 5, 5, pinIN);
    tl.addOscillation(200, 3, 5, 5, pinIN);
    tl.addPulse(250, 5, pinIN);
    return tl;
  },

  '12 KM141P 4-TO-1 MULTIPLEXER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA, pinZ,
      pinB, pinNC3,
      pinC, pinS0,
      pinD, pinS1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA.label = 'A';
    pinZ.label = 'Z';
    pinB.label = 'B';
    pinNC3.label = 'N/C';
    pinC.label = 'C';
    pinS0.label = 'S0';
    pinD.label = 'D';
    pinS1.label = 'S1';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A
    tl.addOscillation(10, 9, 10, 10, pinA);
    tl.addPulseRange(190, 240, pinA);
    tl.addPulse(250, 10, pinA);
    // B
    tl.addPulse(10, 30, pinB);
    tl.addOscillation(60, 3, 20, 20, pinB);
    tl.addPulse(190, 10, pinB);
    tl.addPulse(220, 20, pinB);
    tl.addPulse(250, 20, pinB);
    // C
    tl.addPulseRange(40, 80, pinC);
    tl.addPulseRange(120, 160, pinC);
    tl.addPulseRange(170, 240, pinC);
    tl.addPulse(250, 20, pinC);
    // D
    tl.addPulseRange(0, 40, pinD);
    tl.addPulseRange(80, 160, pinD);
    tl.addOscillation(200, 2, 10, 10, pinD);
    tl.addPulse(250, 20, pinD);
    // S0
    tl.addOscillation(10, 10, 10, 10, pinS0);
    tl.addPulse(210, 30, pinS0);
    tl.addPulse(250, 10, pinS0);
    // S1
    tl.addOscillation(20, 4, 20, 20, pinS1);
    tl.addPulse(190, 10, pinS1);
    tl.addPulse(220, 20, pinS1);
    tl.addPulse(260, 10, pinS1);
    return tl;
  },

  '13 KC84C 4-BIT COUNTER WITH CLEAR': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinY0,
      pinCLR, pinY1,
      pinINC, pinY2,
      pinNC6, pinY3,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinY0.label = 'Y0';
    pinCLR.label = 'CLR';
    pinY1.label = 'Y1';
    pinINC.label = 'INC';
    pinY2.label = 'Y2';
    pinNC6.label = 'N/C';
    pinY3.label = 'Y3';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // CLR
    tl.addPulse(0, 10, pinCLR);
    tl.addPulse(190, 10, pinCLR);
    tl.addPulse(260, 10, pinCLR);
    // INC
    tl.addOscillation(20, 15, 5, 5, pinINC);
    tl.addOscillation(210, 3, 5, 5, pinINC);
    return tl;
  },

  '14 KC74S 4-BIT SHIFT REGISTER S-TO-P': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinQ0,
      pinD, pinQ1,
      pinCLK, pinQ2,
      pinNC6, pinQ3,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinQ0.label = 'Q0';
    pinD.label = 'D';
    pinQ1.label = 'Q1';
    pinCLK.label = 'CLK';
    pinQ2.label = 'Q2';
    pinNC6.label = 'N/C';
    pinQ3.label = 'Q3';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // D
    tl.addTogglePoints(pinD, 20, 40, 50, 60, 80, 90, 110, 140, 160, 170, 180, 210, 220, 230, 250, 270);
    // CLK
    tl.addOscillation(20, 15, 5, 5, pinCLK);
    tl.addOscillation(210, 3, 5, 5, pinCLK);
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
  },

  '16 KA181 2-BIT LOGICAL FUNCTION UNIT': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinA0, pinF0,
      pinA1, pinF1,
      pinB0, pinC0,
      pinB1, pinC1,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinA0.label = 'A0';
    pinF0.label = 'F0';
    pinA1.label = 'A1';
    pinF1.label = 'F1';
    pinB0.label = 'B0';
    pinC0.label = 'C0';
    pinB1.label = 'B1';
    pinC1.label = 'C1';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A0
    tl.addTogglePoints(pinA0, 10, 20, 50, 70, 80, 90, 120, 140, 150, 160, 190, 210, 220, 230, 260);
    // A1
    tl.addOscillation(30, 2, 10, 20, pinA1);
    tl.addOscillation(100, 2, 10, 20, pinA1);
    tl.addOscillation(170, 2, 10, 20, pinA1);
    tl.addOscillation(240, 2, 10, 20, pinA1);
    // B0
    tl.addOscillation(20, 2, 10, 30, pinB0);
    tl.addOscillation(90, 2, 10, 30, pinB0);
    tl.addOscillation(160, 2, 10, 30, pinB0);
    tl.addOscillation(230, 2, 10, 30, pinB0);
    // B1
    tl.addOscillation(30, 4, 40, 30, pinB1);
    // F0
    tl.addTogglePoints(pinF0, 70, 140, 210);
    // F1
    tl.addKeyFrame(140, pinF1, true);
    return tl;
  },

  '17 X901 RADIO MESSAGE STREAM DECODER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinK0, pinOUT0,
      pinK1, pinOUT1,
      pinK2, pinOUT2,
      pinIN, pinCLK,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinK0.label = 'K0';
    pinOUT0.label = 'OUT0';
    pinK1.label = 'K1';
    pinOUT1.label = 'OUT1';
    pinK2.label = 'K2';
    pinOUT2.label = 'OUT2';
    pinIN.label = 'IN';
    pinCLK.label = 'CLK';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // K0
    tl.addOscillation(130, 3, 10, 10, pinK0);
    tl.addOscillation(230, 2, 10, 20, pinK0);
    // K1
    tl.addTogglePoints(pinK1, 130, 150, 180, 200, 230, 260);
    // K2
    tl.addTogglePoints(pinK2, 140, 170, 190, 200, 240, 250);
    // IN
    tl.addTogglePoints(pinIN, 20, 40, 50, 60, 80, 90, 100, 120);
    // CLK
    tl.addOscillation(10, 11, 5, 5, pinCLK);
    tl.addPulse(210, 5, pinCLK);
    return tl;
  },

  '18 X902 GRENADE LAUNCHER AMMO COUNTER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinY0,
      pinRST, pinY1,
      pinDEC, pinY2,
      pinLOW, pinY3,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinY0.label = 'Y0';
    pinRST.label = 'RST';
    pinY1.label = 'Y1';
    pinDEC.label = 'DEC';
    pinY2.label = 'Y2';
    pinLOW.label = 'LOW';
    pinY3.label = 'Y3';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // RST
    tl.addTogglePoints(pinRST, 0, 10, 150, 160, 210, 220);
    // DEC
    tl.addOscillation(20, 12, 5, 5, pinDEC);
    tl.addOscillation(170, 3, 5, 5, pinDEC);
    tl.addOscillation(230, 3, 5, 5, pinDEC);
    return tl;
  },

  '19 X903 GATLING CANNON FIRE CONTROLLER': (network) => {
    const pins = network.getPinNodes();
    if (pins.length !== 12) {
      throw new Error(`Pin count must be 12, got ${pins.length}`);
    }
    const [
      pinVCC0, pinVCC1,
      pinNC0, pinA,
      pinFIRE, pinAN,
      pinLOCK, pinB,
      pinTRIG, pinBN,
      pinVCC2, pinVCC3,
    ] = pins;
    pinVCC0.label = 'VCC';
    pinVCC1.label = 'VCC';
    pinVCC2.label = 'VCC';
    pinVCC3.label = 'VCC';
    pinNC0.label = 'N/C';
    pinA.label = 'A+';
    pinFIRE.label = 'FIRE';
    pinAN.label = 'A-';
    pinLOCK.label = 'LOCK';
    pinB.label = 'B+';
    pinTRIG.label = 'TRIG';
    pinBN.label = 'B-';
    const tl = new Timeline(network);
    tl.addVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // FIRE
    tl.addTogglePoints(pinFIRE, 30, 110, 130, 250);
    // LOCK
    tl.addTogglePoints(pinLOCK, 150, 180, 210, 230);
    return tl;
  },

}

export { kohctpyktop };