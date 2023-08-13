import { Network, PinNode, Timeline } from "@/simulation";
import CircuitSimulation from "@/simulation/CircuitSimulation";
import Sequence from "@/simulation/Sequence";

type KOHCTPYKTOPLevelName =
    '01 KT411I QUAD INVERTER GATE'
  | '02 KT221A DUAL 2-INPUT AND GATE'
  | '03 KT141AO 4-INPUT AND-OR GATE'
  | '04 KO229 POWER ON RESET GENERATOR'
  | '05 KO223 DUAL FIXED FREQUENCY OSCILLATOR'
  | '06 KL2S1 DUAL SET-RESET LATCH'
  | '07 KL2T1 DUAL TOGGLE LATCH'
  | '08 KO224X DUAL FREQUENCY OSCILLATOR'
  | '09 KD124 2-TO-4 LINE DECODER'
  | '10 KA180 2-BIT ADDER WITH CARRY'
  | '11 KC82F DIVIDE-BY-FOUR COUNTER'
  | '12 KM141P 4-TO-1 MULTIPLEXER'
  | '13 KC84C 4-BIT COUNTER WITH CLEAR'
  | '14 KC74S 4-BIT SHIFT REGISTER S-TO-P'
  | '15 KR8S1 8-BIT ADDRESSABLE SRAM'
  | '16 KA181 2-BIT LOGICAL FUNCTION UNIT'
  | '17 X901 RADIO MESSAGE STREAM DECODER'
  | '18 X902 GRENADE LAUNCHER AMMO COUNTER'
  | '19 X903 GATLING CANNON FIRE CONTROLLER';


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

type CircuitBuilder<T extends string|number|symbol> = Record<T, (network: Network) => CircuitSimulation>

const assignVCC = (...pins: PinNode[]) => {
  pins.forEach((pin) => {
    pin.label = 'VCC';
    pin.active = true;
  });
}

const kohctpyktop: CircuitBuilder<KOHCTPYKTOPLevelName> = {

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
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    pinA0.label = 'A0';
    pinY0.label = 'Y0';
    pinA1.label = 'A1';
    pinY1.label = 'Y1';
    pinA2.label = 'A2';
    pinY2.label = 'Y2';
    pinA3.label = 'A3';
    pinY3.label = 'Y3';
    const sim = new CircuitSimulation(network);
    const seqA0 = new Sequence()
      .addOscillation(0, 14, 10, 10);
    const seqA1 = new Sequence()
      .addOscillation(0, 9, 10, 20);
    const seqA2 = new Sequence()
      .addOscillation(0, 7, 10, 30);
    const seqA3 = new Sequence()
      .repeatTogglePoints(0, 5, 10, [ 0, 10, 20, 40 ])
      .addPulse(250, 20);
    const seqY0 = new Sequence()
      .applyFrames(seqA0.getFrames().map(s => !s));
    const seqY1 = new Sequence()
      .applyFrames(seqA1.getFrames().map(s => !s));
    const seqY2 = new Sequence()
      .applyFrames(seqA2.getFrames().map(s => !s));
    const seqY3 = new Sequence()
      .applyFrames(seqA3.getFrames().map(s => !s));
    sim.setInputSequence(pinA0, seqA0);
    sim.setInputSequence(pinA1, seqA1);
    sim.setInputSequence(pinA2, seqA2);
    sim.setInputSequence(pinA3, seqA3);
    sim.setOutputSequence(pinY0, seqY0);
    sim.setOutputSequence(pinY1, seqY1);
    sim.setOutputSequence(pinY2, seqY2);
    sim.setOutputSequence(pinY3, seqY3);
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    const seqA0 = new Sequence();
    for (let i = 0; i < 13; i++) {
      seqA0.addPulse(i*20 + 10, 10);
    }
    const seqB0 = new Sequence();
    for (let i = 0; i < 6; i++) {
      seqB0.addPulse(i*40 + 20, 20);
    }
    seqB0.addPulse(260, 10);
    const seqA1 = new Sequence();
    for (let i = 0; i < 9; i++) {
      seqA1.addPulse(i*30 + 10, 20);
    }
    const seqB1 = new Sequence();
    for (let i = 0; i < 5; i++) {
      seqB1.addPulse(i*50 + 20, 10);
    }
    sim.setInputSequence(pinA0, seqA0);
    sim.setInputSequence(pinB0, seqB0);
    sim.setInputSequence(pinA1, seqA1);
    sim.setInputSequence(pinB1, seqB1);
    sim.setOutputSequence(pinY0, new Sequence().addOscillation(30, 6, 10, 30));
    sim.setOutputSequence(pinY1, new Sequence().repeatTogglePoints(20, 2, 90, [ 0, 10, 50, 60 ]));
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A
    const seqA = new Sequence();
    for (let i = 0; i < 10; i++) {
      seqA.addPulse(i*20 + 10, 10);
    }
    seqA.addPulse(210, 30);
    seqA.addPulse(250, 20);
    sim.setInputSequence(pinA, seqA);
    // B
    const seqB = new Sequence();
    seqB.addPulse(20, 20);
    seqB.addPulse(60, 20);
    seqB.addPulse(90, 30);
    seqB.addPulse(140, 20);
    seqB.addPulse(190, 10);
    seqB.addPulse(220, 20);
    seqB.addPulse(260, 10);
    sim.setInputSequence(pinB, seqB);
    // C
    const seqC = new Sequence();
    seqC.addPulse(30, 50);
    seqC.addPulse(90, 10);
    seqC.addPulse(120, 40);
    seqC.addPulse(200, 40);
    seqC.addPulse(260, 10);
    sim.setInputSequence(pinC, seqC);
    // D
    const seqD = new Sequence();
    seqD.addPulse(30, 10);
    seqD.addPulse(80, 80);
    seqD.addPulse(200, 10);
    seqD.addPulse(220, 20);
    seqD.addPulse(250, 20);
    sim.setInputSequence(pinD, seqD);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // EN0
    const seqEN0 = new Sequence();
    seqEN0.addPulse(40, 100);
    seqEN0.addPulse(180, 70);
    sim.setInputSequence(pinEN0, seqEN0);
    // EN1
    const seqEN1 = new Sequence();
    seqEN1.addPulse(20, 60);
    seqEN1.addPulse(120, 40);
    seqEN1.addPulse(200, 50);
    sim.setInputSequence(pinEN1, seqEN1);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // S0
    const seqS0 = new Sequence();
    seqS0.addPulse(10, 10);
    seqS0.addPulse(100, 10);
    seqS0.addPulse(170, 10);
    sim.setInputSequence(pinS0, seqS0);
    // R0
    const seqR0 = new Sequence();
    seqR0.addPulse(40, 10);
    seqR0.addPulse(120, 10);
    seqR0.addPulse(250, 10);
    sim.setInputSequence(pinR0, seqR0);
    // S1
    const seqS1 = new Sequence();
    seqS1.addPulse(20, 10);
    seqS1.addPulse(60, 10);
    seqS1.addPulse(140, 10);
    seqS1.addPulse(240, 10);
    sim.setInputSequence(pinS1, seqS1);
    // R1
    const seqR1 = new Sequence();
    seqR1.addPulse(50, 10);
    seqR1.addPulse(110, 10);
    seqR1.addPulse(220, 10);
    seqR1.addPulse(260, 10);
    sim.setInputSequence(pinR1, seqR1);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // T0
    const seqT0 = new Sequence();
    seqT0.addPulse(10, 5);
    seqT0.addPulse(40, 5);
    seqT0.addPulse(100, 5);
    seqT0.addPulse(120, 5);
    seqT0.addPulse(170, 5);
    seqT0.addPulse(250, 5);
    sim.setInputSequence(pinT0, seqT0);
    // T1
    const seqT1 = new Sequence();
    seqT0.addPulse(20, 5);
    seqT0.addPulse(30, 5);
    seqT0.addPulse(60, 5);
    seqT0.addPulse(110, 5);
    seqT0.addPulse(140, 5);
    seqT0.addPulse(220, 5);
    seqT0.addPulse(240, 5);
    seqT0.addPulse(260, 5);
    sim.setInputSequence(pinT1, seqT1);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // S0
    const seqS0 = new Sequence();
    seqS0.addPulseRange(40, 140);
    seqS0.addPulseRange(180, 260);
    sim.setInputSequence(pinS0, seqS0);
    // S1
    const seqS1 = new Sequence();
    seqS1.addPulseRange(20, 80);
    seqS1.addPulseRange(120, 160);
    seqS1.addPulseRange(200, 240);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A
    const seqA = new Sequence();
    for (let i = 0; i < 10; i++) {
      seqA.addPulse(i*20 + 10, 10);
    }
    seqA.addPulseRange(210, 240);
    seqA.addPulse(250, 10);
    sim.setInputSequence(pinA, seqA);
    // B
    const seqB = new Sequence();
    for (let i = 0; i < 4; i++) {
      seqB.addPulse(i*40 + 20, 20);
    }
    seqB.addPulse(190, 10);
    seqB.addPulse(220, 20);
    seqB.addPulse(260, 10);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A0
    const seqA0 = new Sequence();
    seqA0.addOscillation(10, 10, 10, 10);
    seqA0.addPulse(210, 30);
    seqA0.addPulse(250, 10);
    sim.setInputSequence(pinA0, seqA0);
    // A1
    const seqA1 = new Sequence();
    seqA1.addOscillation(20, 4, 20, 20);
    seqA1.addPulse(190, 10);
    seqA1.addPulse(220, 20);
    seqA1.addPulse(260, 10);
    sim.setInputSequence(pinA1, seqA1);
    // B0
    const seqB0 = new Sequence();
    seqB0.addOscillation(40, 3, 40, 40);
    // B1
    const seqB1 = new Sequence();
    seqB1.addPulseRange(80, 160);
    seqB1.addPulse(200, 10);
    seqB1.addPulse(220, 10);
    seqB1.addPulse(250, 20);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // IN
    const seqIN = new Sequence();
    seqIN.addOscillation(10, 8, 5, 5);
    seqIN.addOscillation(120, 2, 5, 5);
    seqIN.addOscillation(160, 2, 5, 5);
    seqIN.addOscillation(200, 3, 5, 5);
    seqIN.addPulse(250, 5);
    sim.setInputSequence(pinIN, seqIN);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A
    const seqA = new Sequence();
    seqA.addOscillation(10, 9, 10, 10);
    seqA.addPulseRange(190, 240);
    seqA.addPulse(250, 10);
    sim.setInputSequence(pinA, seqA);
    // B
    const seqB = new Sequence();
    seqB.addPulse(10, 30);
    seqB.addOscillation(60, 3, 20, 20);
    seqB.addPulse(190, 10);
    seqB.addPulse(220, 20);
    seqB.addPulse(250, 20);
    sim.setInputSequence(pinB, seqB);
    // C
    const seqC = new Sequence();
    seqC.addPulseRange(40, 80);
    seqC.addPulseRange(120, 160);
    seqC.addPulseRange(170, 240);
    seqC.addPulse(250, 20);
    sim.setInputSequence(pinC, seqC);
    // D
    const seqD = new Sequence();
    seqD.addPulseRange(0, 40);
    seqD.addPulseRange(80, 160);
    seqD.addOscillation(200, 2, 10, 10);
    seqD.addPulse(250, 20);
    sim.setInputSequence(pinD, seqD);
    // S0
    const seqS0 = new Sequence();
    seqS0.addOscillation(10, 10, 10, 10);
    seqS0.addPulse(210, 30);
    seqS0.addPulse(250, 10);
    sim.setInputSequence(pinS0, seqS0);
    // S1
    const seqS1 = new Sequence();
    seqS1.addOscillation(20, 4, 20, 20);
    seqS1.addPulse(190, 10);
    seqS1.addPulse(220, 20);
    seqS1.addPulse(260, 10);
    sim.setInputSequence(pinS1, seqS1);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // CLR
    const seqCLR = new Sequence();
    seqCLR.addPulse(0, 10);
    seqCLR.addPulse(190, 10);
    seqCLR.addPulse(260, 10);
    sim.setInputSequence(pinCLR, seqCLR);
    // INC
    const seqINC = new Sequence();
    seqINC.addOscillation(20, 15, 5, 5);
    seqINC.addOscillation(210, 3, 5, 5);
    sim.setInputSequence(pinINC, seqINC);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // D
    const seqD = new Sequence();
    seqD.addTogglePoints(20, 40, 50, 60, 80, 90, 110, 140, 160, 170, 180, 210, 220, 230, 250, 270);
    sim.setInputSequence(pinD, seqD);
    // CLK
    const seqCLK = new Sequence();
    seqCLK.addOscillation(20, 15, 5, 5);
    seqCLK.addOscillation(210, 3, 5, 5);
    sim.setInputSequence(pinCLK, seqCLK);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A0
    const seqA0 = new Sequence();
    seqA0.addPulse(20, 10);
    seqA0.addPulse(50, 20);
    seqA0.addPulse(80, 20);
    seqA0.addPulse(110, 10);
    for (let i = 0; i < 7; i++) {
      seqA0.addPulse(i*20 + 140, 10);
    }
    sim.setInputSequence(pinA0, seqA0);
    // A1
    const seqA1 = new Sequence();
    seqA1.addPulse(30, 40);
    seqA1.addPulse(100, 20);
    seqA1.addPulse(150, 20);
    seqA1.addPulse(190, 20);
    seqA1.addPulse(220, 10);
    seqA1.addPulse(240, 10);
    seqA1.addPulse(260, 10);
    sim.setInputSequence(pinA1, seqA1);
    // A2
    const seqA2 = new Sequence();
    seqA2.addPulse(70, 50);
    seqA2.addPulse(170, 40);
    seqA2.addPulse(220, 10);
    seqA2.addPulse(240, 10);
    seqA2.addPulse(260, 10);
    sim.setInputSequence(pinA2, seqA2);
    // R/W
    const seqRW = new Sequence();
    seqRW.addPulse(0, 130);
    seqRW.addPulse(240, 10);
    sim.setInputSequence(pinRW, seqRW);
    // CLK
    const seqCLK = new Sequence();
    for (let i = 0; i < 11; i++) {
      seqCLK.addPulse(i*10 + 10, 5);
    }
    seqCLK.addPulse(130, 100);
    seqCLK.addPulse(240, 5);
    seqCLK.addPulse(260, 10);
    sim.setInputSequence(pinCLK, seqCLK);
    // Din
    const seqDin = new Sequence();
    seqDin.addPulse(10, 10);
    seqDin.addPulse(40, 20);
    seqDin.addPulse(80, 10);
    seqDin.addPulse(110, 10);
    seqDin.addPulse(140, 10);
    sim.setInputSequence(pinDin, seqDin);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // A0
    const seqA0 = new Sequence();
    seqA0.addTogglePoints(10, 20, 50, 70, 80, 90, 120, 140, 150, 160, 190, 210, 220, 230, 260);
    sim.setInputSequence(pinA0, seqA0);
    // A1
    const seqA1 = new Sequence();
    seqA1.addOscillation(30, 2, 10, 20);
    seqA1.addOscillation(100, 2, 10, 20);
    seqA1.addOscillation(170, 2, 10, 20);
    seqA1.addOscillation(240, 2, 10, 20);
    sim.setInputSequence(pinA1, seqA1);
    // B0
    const seqB0 = new Sequence();
    seqB0.addOscillation(20, 2, 10, 30);
    seqB0.addOscillation(90, 2, 10, 30);
    seqB0.addOscillation(160, 2, 10, 30);
    seqB0.addOscillation(230, 2, 10, 30);
    sim.setInputSequence(pinB0, seqB0);
    // B1
    const seqB1 = new Sequence();
    seqB1.addOscillation(30, 4, 40, 30);
    sim.setInputSequence(pinB1, seqB1);
    // F0
    const seqF0 = new Sequence();
    seqF0.addTogglePoints(70, 140, 210);
    sim.setInputSequence(pinF0, seqF0);
    // F1
    const seqF1 = new Sequence();
    seqF1.setFrame(140, true);
    sim.setInputSequence(pinF1, seqF1);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // K0
    const seqK0 = new Sequence();
    seqK0.addOscillation(130, 3, 10, 10);
    seqK0.addOscillation(230, 2, 10, 20);
    sim.setInputSequence(pinK0, seqK0);
    // K1
    const seqK1 = new Sequence();
    seqK1.addTogglePoints(130, 150, 180, 200, 230, 260);
    sim.setInputSequence(pinK1, seqK1);
    // K2
    const seqK2 = new Sequence();
    seqK2.addTogglePoints(140, 170, 190, 200, 240, 250);
    sim.setInputSequence(pinK2, seqK2);
    // IN
    const seqIN = new Sequence();
    seqIN.addTogglePoints(20, 40, 50, 60, 80, 90, 100, 120);
    sim.setInputSequence(pinIN, seqIN);
    // CLK
    const seqCLK = new Sequence();
    seqCLK.addOscillation(10, 11, 5, 5);
    seqCLK.addPulse(210, 5);
    sim.setInputSequence(pinCLK, seqCLK);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // RST
    const seqRST = new Sequence();
    seqRST.addTogglePoints(0, 10, 150, 160, 210, 220);
    sim.setInputSequence(pinRST, seqRST);
    // DEC
    const seqDEC = new Sequence();
    seqDEC.addOscillation(20, 12, 5, 5);
    seqDEC.addOscillation(170, 3, 5, 5);
    seqDEC.addOscillation(230, 3, 5, 5);
    sim.setInputSequence(pinDEC, seqDEC);
    // TODO: outputs
    return sim;
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
    const sim = new CircuitSimulation(network);
    assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
    // FIRE
    const seqFIRE = new Sequence();
    seqFIRE.addTogglePoints(30, 110, 130, 250);
    sim.setInputSequence(pinFIRE, seqFIRE);
    // LOCK
    const seqLOCK = new Sequence();
    seqLOCK.addTogglePoints(150, 180, 210, 230);
    sim.setInputSequence(pinLOCK, seqLOCK);
    // TODO: outputs
    return sim;
  },

}

export { kohctpyktop };