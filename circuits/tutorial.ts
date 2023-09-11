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

type LevelNames =
    '01 Introduction'
  | '02 Metal, Silicon and Vias'
  | '03 PNP Gates'
  | '04 NPN Gates'
  | '05 Propagation Delay';

const tutorial: Record<LevelNames, CircuitSimulationFactory> = {

/*
TODO description 01 Introduction

Your primary objective is to build a circuit that will produce the expected output(s).
You must pass the verification test with at least 97% accuracy in order to mark a level as
complete.

Goal: Connect the input and output pins by drawing metal.
*/
  '01 Introduction': {
    pinRows: 1,
    width: 14,
    height: 7,
    setup: (network) => {
      const [
        pinIn, pinOut,
      ] = network.getPinNodes();
      pinIn.label = 'In';
      pinOut.label = 'Out';
      const sim = new CircuitSimulation(network, 280);
       const seq = new Sequence()
         .addOscillation(10, 3, 50, 50);
      sim.setInputSequence(pinIn, seq);
      sim.setOutputSequence(pinOut, seq.slice(0));
      return sim;
    }
  },

/*
**Metal** and **silicon** are the two primary materials used to build our circuits.
Metal and silicon are placed on different layers of the chip, which allows current to flow across
them.
<IMG: show metal flowing current above silicon>

Place **vias** to make connections between the two layers.
<IMG: show silicon connected with metal>

Silicon comes in two flavors: **P-Type** and **N-Type**. By themselves, they are simply conductive
materials just like metal. However, by drawing one type over another, we can create a **gate** to
control the flow of current, which will be demonstrated in the next level. In this level, either
type of silicon will work.

Goal: Place metal, silicon and vias in order to connect the matching pairs of pins.
*/
  '02 Metal, Silicon and Vias': {
    pinRows: 2,
    width: 22,
    height: 11,
    setup: (network) => {
      const [
        pinInA, pinOutB,
        pinInB, pinOutA,
      ] = network.getPinNodes();
      pinInA.label = 'In A';
      pinOutB.label = 'Out B';
      pinInB.label = 'In B';
      pinOutA.label = 'Out A';
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .addOscillation(10, 7, 20, 20);
      const seqB = new Sequence()
        .addOscillation(20, 5, 30, 20);
      sim.setInputSequence(pinInA, seqA);
      sim.setInputSequence(pinInB, seqB);
      sim.setOutputSequence(pinOutB, seqB);
      sim.setOutputSequence(pinOutA, seqA);
      return sim;
    }
  },

/*
There are two types of gates: the **PNP** gate and the **NPN** gate.
<IMG: Show PNP and NPN gates>

Gates can be built by drawing silicon over top silicon of the opposite type.
<IMG: Show steps of PNP gate being drawn>

The first gate we will build is the PNP gate, which is N-Type silicon drawn over P-Type silicon.
A PNP gate allows current to flow through the P-Type silicon, unless a signal is applied to the
N-Type silicon, in which case the gate is closed. When the signal is removed, the gate opens again.

By using a PNP gate, we can invert a signal. This is called a **NOT gate**.
<IMG: Show PNP gate with and without signal>
<IMG: Scope of inverted signal>

You may notice that the output signal is not an exact inversion of the input signal, but
is slightly delayed. This is due to **propagation delay**, which is the time it takes for the gate
to transition between opened or closed. This is expected, and the verification test will succeed if
the output signal matches within a short tolerance. Progagation delay will be explored further in a
later tutorial level.

Goal: Build a PNP gate to invert the input signal.
*/
  '03 PNP Gates': {
    pinRows: 2,
    width: 22,
    height: 11,
    setup: (network) => {
      const [
        pinA, pinVCC,
        pinNC, pinNA,
      ] = network.getPinNodes();
      assignVCC(pinVCC);
      pinA.label = 'A';
      pinNA.label = '/A';
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .repeatTogglePoints(10, 4, 30, [ 0, 10, 20, 40 ]);
      sim.setInputSequence(pinA, seqA);
      const [ seqNA ] = createSequencesFromInputs(
        [ seqA ],
        ({ inputs }) => {
          const [ a ] = inputs;
          return [ !a ];
        },
      );
      sim.setOutputSequence(pinNA, seqNA);
      return sim;
    }
  },

/*
The other type of gate is the NPN gate, which is P-Type silicon drawn over N-Type silicon.
An NPN works the opposite way of a PNP gate. An NPN gate allows current to flow through the N-Type
silicon, but only when there is a signal applied to the P-Type silicon. When the signal is removed,
the gate closes again.

<IMG: Show NPN gate with and without signal>
<IMG: Scope of signal>

A single NPN gate used as shown above is not very useful here, but by chaining multiple NPN gates
we can stop the flow of current unless all inputs are active. This is called an **AND gate**.

<IMG: Show AND gate in use: 00 10 01 11>

Goal: Build an AND gate by using two NPN gates.

Note: Building an AND gate is possible only one NPN gate. However, doing so can result with some
side-effects due to propagation delay, which may or may not be beneficial to your circuit design.
Feel free to try it out and see what happens!
*/
  '04 NPN Gates': {
    pinRows: 2,
    width: 22,
    height: 11,
    setup: (network) => {
      const [
        pinA, pinVCC,
        pinB, pinY,
      ] = network.getPinNodes();
      assignVCC(pinVCC);
      pinA.label = 'A';
      pinB.label = 'B';
      pinY.label = 'Y';
      const sim = new CircuitSimulation(network, 280);
      const seqA = new Sequence()
        .addOscillation(10, 10, 10, 10)
        .addOscillation(210, 2, 20, 20);
      const seqB = new Sequence()
        .addOscillation(20, 7, 20, 10)
        .addPulse(220, 50);
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
    }
  },

/*
TODO description 05 Propagation Delay
*/
  '05 Propagation Delay': {
    pinRows: 1,
    width: 36,
    height: 7,
    setup: (network) => {
      const [
        pinIn, pinDelay,
      ] = network.getPinNodes();
      pinIn.label = 'In';
      pinDelay.label = 'Delay';
      const sim = new CircuitSimulation(network, 280);
      const seqIn = new Sequence()
        .addTogglePoints(10, 40, 60, 120, 150, 160, 200, 250);
      sim.setInputSequence(pinIn, seqIn);
      const delay = 10;
      const [ seqDelay ] = createSequencesFromInputs(
        [ seqIn ],
        ({ inputs, state }) => {
          const [ a ] = inputs;
          if (a) {
            state.counter++;
          } else {
            state.counter = 0;
          }
          return [ state.counter > delay ];
        },
        {
          counter: 0,
        }
      );
      sim.setOutputSequence(pinDelay, seqDelay);
      return sim;
    }
  },

};

export { tutorial };
