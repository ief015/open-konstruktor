import { CircuitSimulationFactory } from "@/circuits";
import { Network, PinNode } from "@/simulation";
import { CircuitSimulation } from "@/simulation/CircuitSimulation";
import Sequence from "@/simulation/Sequence";
import createSequencesFromInputs from "@/utils/createSequencesFromInputs";

const assignVCC = (...pins: PinNode[]) => {
  pins.forEach((pin) => {
    pin.label = 'VCC';
    pin.active = true;
  });
}

const generateRandomSequence = (length: number, pulseSize: number = 10, freq: number = 0.5) => {
  const seq = new Sequence();
  for (let i = 0; i < length; i += pulseSize) {
    if (Math.random() < freq) {
      seq.addPulse(i, pulseSize);
    }
  }
  return seq.slice(0, length);
}

type LevelNames =
    'OC2C1 DUAL FULL COMPARATOR'
  | 'Very large test';

const openkonstruktor: Record<LevelNames, CircuitSimulationFactory> = {

  'OC2C1 DUAL FULL COMPARATOR': {
    pinRows: 7,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA0, pinA1,
        pinB0, pinB1,
        pinXL0, pinXL1,
        pinX0, pinX1,
        pinXG0, pinXG1,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA0.label =   'A0';
      pinA1.label =   'A1';
      pinB0.label =   'B0';
      pinB1.label =   'B1';
      pinXL0.label =  '-X0';
      pinXL1.label =  '-X1';
      pinX0.label =   'X0';
      pinX1.label =   'X1';
      pinXG0.label =  '+X0';
      pinXG1.label =  '+X1';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
       const seqA0 = new Sequence()
         .addOscillation(10, 7, 20, 20);
       const seqB0 = new Sequence()
         .addOscillation(20, 5, 30, 20);
       const seqA1 = new Sequence()
         .addOscillation(0, 3, 10, 20)
         .addOscillation(80, 2, 20, 10)
         .addOscillation(200, 3, 10, 10);
       const seqB1 = new Sequence()
         .addOscillation(10, 2, 10, 30)
         .addOscillation(90, 2, 30, 20)
         .addOscillation(190, 3, 20, 10);
      //const seqA0 = generateRandomSequence(280, 10, 0.6);
      //const seqB0 = generateRandomSequence(280, 10, 0.4);
      //const seqA1 = generateRandomSequence(280, 10, 0.6);
      //const seqB1 = generateRandomSequence(280, 10, 0.4);
      sim.setInputSequence(pinA0, seqA0);
      sim.setInputSequence(pinB0, seqB0);
      sim.setInputSequence(pinA1, seqA1);
      sim.setInputSequence(pinB1, seqB1);
      const [
        seqXL0, seqX0, seqXG0,
        seqXL1, seqX1, seqXG1,
      ] = createSequencesFromInputs(
        [ seqA0, seqB0, seqA1, seqB1 ],
        ({ inputs }) => {
          const [ a0, b0, a1, b1 ] = inputs;
          return [
            a0 < b0,
            a0 === b0,
            a0 > b0,
            a1 < b1,
            a1 === b1,
            a1 > b1,
          ];
        },
      );
      sim.setOutputSequence(pinXL0, seqXL0);
      sim.setOutputSequence(pinX0, seqX0);
      sim.setOutputSequence(pinXG0, seqXG0);
      sim.setOutputSequence(pinXL1, seqXL1);
      sim.setOutputSequence(pinX1, seqX1);
      sim.setOutputSequence(pinXG1, seqXG1);
      return sim;
    }
  },

  'Very large test': {
    width: 100,
    height: 100,
    setup: (network) => {
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
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      // Add I/O sequences...
      return sim;
    }
  },

};

export { openkonstruktor };
