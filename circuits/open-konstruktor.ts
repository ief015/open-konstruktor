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
    'Test';

const openkonstruktor: Record<LevelNames, CircuitSimulationFactory> = {

  'Test': (network) => {
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
    pinNC0.label = 'N/C';
    pinNC1.label = 'N/C';
    pinNC2.label = 'N/C';
    pinNC3.label = 'N/C';
    pinNC4.label = 'N/C';
    pinNC5.label = 'N/C';
    pinNC6.label = 'N/C';
    pinNC7.label = 'N/C';
    const sim = new CircuitSimulation(network, 280);
    // Add I/O sequences...
    return sim;
  },

};

export { openkonstruktor };
