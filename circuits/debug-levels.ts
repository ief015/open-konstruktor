import type { CircuitSimulationFactory } from "@/circuits";
import { PinNode, CircuitSimulation, Sequence } from "@/simulation";
import createSequencesFromInputs from "@/utils/createSequencesFromInputs";

const assignVCC = (...pins: PinNode[]) => {
  pins.forEach((pin) => {
    pin.label = 'VCC';
    pin.active = true;
  });
}

type LevelNames =
  'Very large test';

const debugLevels: Record<LevelNames, CircuitSimulationFactory> = {

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
      return sim;
    }
  },

};

export { debugLevels };
