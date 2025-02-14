import type { CircuitSimulationFactory } from "@/circuits";
import { PinNode, CircuitSimulation, Sequence } from "@/simulation";
import createSequencesFromInputs from "@/utils/createSequencesFromInputs";

const assignVCC = (...pins: PinNode[]) => {
  pins.forEach((pin) => {
    pin.label = 'VCC';
    pin.active = true;
  });
}

const generateRandomSequence = (length: number, pulseSize: number = 10, freq: number = 0.5, spacing: number = 0) => {
  const seq = new Sequence();
  for (let i = 0; i < length; i += (pulseSize + spacing)) {
    if (Math.random() < freq) {
      seq.addPulse(i, pulseSize);
    }
  }
  return seq.slice(0, length);
}

/*
type LevelNames =
    '01 DUAL INVERTER GATE'
  | '02 2-INPUT AND GATE'
  | '03 2-INPUT NAND GATE'
  | '04 1-TO-2 DECODER'
  | '05 4-INPUT AND/NAND GATE'
  | '06 4-INPUT OR/NOR GATE'

  | '20 2-INPUT CLOCKED AND GATE'
  | '21 OM1S1 SRAM CELL'

  | '30 OC2C1 DUAL FULL COMPARATOR'
  | '31 OL2J1 DUAL J-K FLIP-FLOP'

  | '40 OD7S1 7-SEGMENT DISPLAY'
*/

type LevelNames =
  // 01-10 GATES
    'DUAL INVERTER GATE'
  | '2-INPUT AND GATE'
  | '2-INPUT NAND GATE'
  | '2-INPUT OR GATE'
  | '2-INPUT AND/NAND GATE'
  | '2-INPUT OR/NOR GATE'
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '4-INPUT AND-OR GATE'

  // 11-20 OSCILLATORS AND TIMERS
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO

  // 21-30 FLIP-FLOPS
  // | 'OM1SRL1 DUAL S-R LATCH' // TODO
  | '' // TODO
  // | 'OM1TL1 DUAL T LATCH' // TODO
  | '' // TODO
  | '' // TODO
  // | 'OM1SRF1 DUAL S-R FLIP-FLOP' // TODO
  | '' // TODO
  // | 'OM1DF1 DUAL D FLIP-FLOP' // TODO 
  | '' // TODO
  | '' // TODO

  // 31-40
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | 'DUAL 2-INPUT CLOCKED AND GATE'
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | 'OM1SRAM1 SRAM CELL'

  // 41-50
  | 'OC2C1 DUAL FULL COMPARATOR'
  | '' // TODO
  | '' // TODO
  | 'OM2JF1 DUAL J-K FLIP-FLOP'
  | '' // TOOD
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO

  // 51-60
  // | 'OM1S1 SRAM CELL' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
  | '' // TODO
;

const openkonstruktor: Record<LevelNames, CircuitSimulationFactory> = {
  '': {
    pinRows: 6,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinNC0, pinNC1,
        pinNC2, pinNC3,
        pinNC4, pinNC5,
        pinNC6, pinNC7,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      return sim;
    },
  },

  'DUAL INVERTER GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA0, pinY1,
        pinY0, pinA1,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA0.label = 'A0';
      pinA1.label = 'A1';
      pinY0.label = 'Y0';
      pinY1.label = 'Y1';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA0 = new Sequence()
        .repeatTogglePoints(10, 3, 0, [ 10, 20, 50, 80 ]);
      const seqA1 = new Sequence()
        .repeatTogglePoints(20, 4, 0, [ 10, 30, 50, 60 ]);
      sim.setInputSequence(pinA0, seqA0);
      sim.setInputSequence(pinA1, seqA1);
      const [ seqY0, seqY1 ] = createSequencesFromInputs(
        [ seqA0, seqA1 ],
        ({ inputs }) => {
          const [ a0, a1 ] = inputs;
          return [ !a0, !a1 ];
        },
      );
      sim.setOutputSequence(pinY0, seqY0);
      sim.setOutputSequence(pinY1, seqY1);
      return sim;
    },
  },

  '2-INPUT AND GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinNC0,
        pinB, pinY,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(10, 4, 10, [ 0, 10 ])
        .repeatTogglePoints(100, 2, 0, [ 0, 10, 40, 50, 60, 70, 80 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(0, 2, 20, [ 0, 20 ])
        .repeatTogglePoints(90, 2, 0, [ 0, 10, 30, 40, 50, 70, 80, 90 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      const [ seqY ] = createSequencesFromInputs(
        [ seqA, seqB ],
        ({ inputs }) => {
          const [ a, b ] = inputs;
          return [ a && b ];
        },
      );
      sim.setOutputSequence(pinY, seqY);
      return sim;
    },
  },

  '2-INPUT NAND GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinNC0,
        pinB, pinY,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(10, 4, 10, [ 0, 10 ])
        .repeatTogglePoints(100, 2, 0, [ 0, 40, 50, 60, 70, 80 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(0, 2, 20, [ 0, 20 ])
        .repeatTogglePoints(90, 2, 0, [ 0, 10, 30, 50, 80, 90 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      const [ seqY ] = createSequencesFromInputs(
        [ seqA, seqB ],
        ({ inputs }) => {
          const [ a, b ] = inputs;
          return [ !(a && b) ];
        },
      );
      sim.setOutputSequence(pinY, seqY);
      return sim;
    },
  },

  '2-INPUT OR GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinNC0,
        pinB, pinY,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(20, 4, 10, [ 0, 10 ])
        .repeatTogglePoints(100, 2, 0, [ 0, 20, 40, 50, 70 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(10, 3, 20, [ 0, 20 ])
        .repeatTogglePoints(130, 3, 10, [ 0, 10, 30, 40 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      const [ seqY ] = createSequencesFromInputs(
        [ seqA, seqB ],
        ({ inputs: [ a, b ] }) => {
          return [ a || b ];
        },
      );
      sim.setOutputSequence(pinY, seqY);
      return sim;
    },
  },

  '2-INPUT AND/NAND GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinY,
        pinB, pinYN,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      pinYN.label = '/Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(20, 4, 10, [ 0, 10 ])
        .repeatTogglePoints(100, 2, 0, [ 0, 10, 20, 40, 80 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(10, 3, 20, [ 0, 20 ])
        .repeatTogglePoints(120, 2, 10, [ 0, 10, 40, 60 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      const [ seqY, seqYN ] = createSequencesFromInputs(
        [ seqA, seqB ],
        ({ inputs: [ a, b ] }) => {
          const y = a && b;
          return [ y, !y ];
        },
      );
      sim.setOutputSequence(pinY, seqY);
      sim.setOutputSequence(pinYN, seqYN);
      return sim;
    },
  },

  '2-INPUT OR/NOR GATE': {
    pinRows: 4,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinY,
        pinB, pinYN,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      pinYN.label = '/Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(20, 3, 10, [ 0, 10 ])
        .repeatTogglePoints(80, 4, 10, [ 0, 10, 40 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(10, 3, 20, [ 0, 20 ])
        .repeatTogglePoints(140, 2, 30, [ 0, 20, 30, 40 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      const [ seqY, seqYN ] = createSequencesFromInputs(
        [ seqA, seqB ],
        ({ inputs: [ a, b ] }) => {
          const y = a || b;
          return [ y, !y ];
        },
      );
      sim.setOutputSequence(pinY, seqY);
      sim.setOutputSequence(pinYN, seqYN);
      return sim;
    },
  },

  '4-INPUT AND-OR GATE': {
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinA, pinNC0,
        pinB, pinX,
        pinC, pinY,
        pinD, pinNC1,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinA.label = 'A';
      pinB.label = 'B';
      pinC.label = 'C';
      pinD.label = 'D';
      pinX.label = 'X';
      pinY.label = 'Y';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(10, 4, 30, [ 0, 10, 40 ]);
      const seqB = new Sequence()
        .repeatTogglePoints(20, 4, 20, [ 0, 20, 40 ]);
      const seqC = new Sequence()
        .repeatTogglePoints(10, 4, 30, [ 0, 20, 40 ]);
      const seqD = new Sequence()
        .repeatTogglePoints(20, 4, 30, [ 0, 20, 30 ]);
      sim.setInputSequence(pinA, seqA);
      sim.setInputSequence(pinB, seqB);
      sim.setInputSequence(pinC, seqC);
      sim.setInputSequence(pinD, seqD);
      const [ seqX, seqY ] = createSequencesFromInputs(
        [ seqA, seqB, seqC, seqD ],
        ({ inputs: [ a, b, c, d ] }) => {
          const x = a && b && c && d;
          const y = a || b || c || d;
          return [ x, y ];
        },
      );
      sim.setOutputSequence(pinX, seqX);
      sim.setOutputSequence(pinY, seqY);
      return sim;
    },
  },

  'DUAL 2-INPUT CLOCKED AND GATE': {
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinY0, pinNC0,
        pinB0, pinA1,
        pinA0, pinB1,
        pinCLK, pinY1,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinCLK.label = 'CLK';
      pinA0.label = 'A0';
      pinB0.label = 'B0';
      pinY0.label = 'Y0';
      pinA1.label = 'A1';
      pinB1.label = 'B1';
      pinY1.label = 'Y1';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqCLK = new Sequence()
        .repeatTogglePoints(40+3, 3, 20, [ 0, 5 ])
        .repeatTogglePoints(150+3, 5, 5, [ 0, 5 ])
        .repeatTogglePoints(220+3, 5, 5, [ 0, 5 ]);
      const seqA0 = new Sequence()
        .repeatTogglePoints(10, 4, 30, [ 0, 10, 40 ]);
      const seqB0 = new Sequence()
        .repeatTogglePoints(20, 4, 20, [ 0, 20, 40 ]);
      const seqA1 = new Sequence()
        .repeatTogglePoints(20, 4, 30, [ 0, 20, 40 ]);
      const seqB1 = new Sequence()
        .repeatTogglePoints(20, 4, 30, [ 0, 20, 30 ]);
      sim.setInputSequence(pinCLK, seqCLK);
      sim.setInputSequence(pinA0, seqA0);
      sim.setInputSequence(pinB0, seqB0);
      sim.setInputSequence(pinA1, seqA1);
      sim.setInputSequence(pinB1, seqB1);
      const [ seqY0, seqY1 ] = createSequencesFromInputs(
        [ seqCLK, seqA0, seqB0, seqA1, seqB1 ],
        ({ inputs: [ clk, a0, b0, a1, b1 ], edges: [ d_clk, d_a0, d_b0, d_a1, d_b1 ], state }) => {
          if (d_clk > 0) {
            state.y0 = a0 && b0;
            state.y1 = a1 && b1;
          }
          return [ state.y0, state.y1 ];
        },
        {
          y0: false,
          y1: false,
        },
      );
      sim.setOutputSequence(pinY0, seqY0);
      sim.setOutputSequence(pinY1, seqY1);
      return sim;
    },
  },

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
      pinA0.label = 'A0';
      pinA1.label = 'A1';
      pinB0.label = 'B0';
      pinB1.label = 'B1';
      pinXL0.label = '-X0';
      pinXL1.label = '-X1';
      pinX0.label = 'X0';
      pinX1.label = 'X1';
      pinXG0.label = '+X0';
      pinXG1.label = '+X1';
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

  'OM2JF1 DUAL J-K FLIP-FLOP': {
    regenOnLoop: true,
    pinRows: 6,
    height: 0,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinJ0, pinJ1,
        pinK0, pinK1,
        pinCLK, pinNC5,
        pinQ0, pinQ1,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinJ0.label = 'J0';
      pinJ1.label = 'J1';
      pinK0.label = 'K0';
      pinK1.label = 'K1';
      pinCLK.label = 'CLK';
      pinQ0.label = 'Q0';
      pinQ1.label = 'Q1';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqJ0 = generateRandomSequence(280, 10, 0.4);
      const seqJ1 = generateRandomSequence(280, 10, 0.4);
      const seqK0 = generateRandomSequence(280, 10, 0.4);
      const seqK1 = generateRandomSequence(280, 10, 0.4);
      const seqCLK = generateRandomSequence(280, 5, 0.5, 5);
      sim.setInputSequence(pinJ0, seqJ0);
      sim.setInputSequence(pinJ1, seqJ1);
      sim.setInputSequence(pinK0, seqK0);
      sim.setInputSequence(pinK1, seqK1);
      sim.setInputSequence(pinCLK, seqCLK);
      const [
        seqQ0, seqQ1,
      ] = createSequencesFromInputs(
        [ seqJ0, seqJ1, seqK0, seqK1, seqCLK ],
        ({ inputs: [ j0, j1, k0, k1, clk ], edges: [ d_j0, d_j1, d_k0, d_k1, d_clk ], state }) => {
          if (d_clk > 0) {
            if (j0 && !k0) {
              state.q[0] = true;
            } else if (!j0 && k0) {
              state.q[0] = false;
            } else if (j0 && k0) {
              state.q[0] = !state.q[0];
            }
            if (j1 && !k1) {
              state.q[1] = true;
            } else if (!j1 && k1) { 
              state.q[1] = false;
            } else if (j1 && k1) {
              state.q[1] = !state.q[1];
            }
          }
          return [
            state.q[0],
            state.q[1],
          ];
        },
        {
          q: [ false, false ],
        },
      );
      sim.setOutputSequence(pinQ0, seqQ0);
      sim.setOutputSequence(pinQ1, seqQ1);
      return sim;
    }
  },

  'OM1SRAM1 SRAM CELL': {
    regenOnLoop: true,
    setup: (network) => {
      const [
        pinVCC0, pinVCC1,
        pinSEL, pinNC1,
        pinRW, pinNC3,
        pinCLK, pinNC5,
        pinDin, pinDout,
        pinVCC2, pinVCC3,
      ] = network.getPinNodes();
      pinSEL.label =  'SEL';
      pinRW.label =   'RW';
      pinCLK.label =  'CLK';
      pinDin.label =  'Din';
      pinDout.label = 'Dout';
      assignVCC(pinVCC0, pinVCC1, pinVCC2, pinVCC3);
      const sim = new CircuitSimulation(network, 280);
      const seqSEL = generateRandomSequence(280, 10, 0.9, 0);
      const seqRW = generateRandomSequence(280, 10, 0.5, 0);
      const seqCLK = generateRandomSequence(280, 5, 0.75, 5);
      const seqDin = generateRandomSequence(280, 10, 0.5, 0);
      sim.setInputSequence(pinSEL, seqSEL);
      sim.setInputSequence(pinRW, seqRW);
      sim.setInputSequence(pinCLK, seqCLK);
      sim.setInputSequence(pinDin, seqDin);
      const [
        seqDout,
      ] = createSequencesFromInputs(
        [ seqSEL, seqRW, seqCLK, seqDin ],
        ({ inputs, state }) => {
          const [ sel, rw, clk, din ] = inputs;
          if (sel && clk && rw) {
            state.dout = din;
          }
          return [
            sel && !rw && clk && state.dout,
          ];
        },
        {
          dout: false,
        },
      );
      sim.setOutputSequence(pinDout, seqDout);
      return sim;
    }
  },

};

export { openkonstruktor };
