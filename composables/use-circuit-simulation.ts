import type { CircuitSimulationFactory } from '@/circuits';
import {
  CircuitSimulation,
  Network,
  type VerificationResult,
} from '@/simulation';
import type { ShallowRef } from 'vue';

export type OnStepAnimHandler = () => void;
export type OnCompleteHandler = (result?: VerificationResult) => void;

export type StepMode = 'fixed' | 'vsync' | 'realtime';

let nextID = 0;

export function useCircuitSimulation() {
  const id = nextID++;
  const name = ref('');
  const network = shallowRef<Network>(new Network());
  const sim = shallowRef<CircuitSimulation>(
    new CircuitSimulation(network.value),
  );
  const field = useFieldGraph();

  const defaultFactory: CircuitSimulationFactory = {
    key: '',
    setup: (network) => new CircuitSimulation(network),
  };
  const currentFactory = shallowRef<CircuitSimulationFactory>(defaultFactory);
  const levelInfo = useLevelInfo(currentFactory);

  const pauseOnError = ref(false);
  const currentFrame = ref(0);

  const timer = useSimulationTimer({
    onStart() {
      sim.value.reset();
    },
    onStop() {
      sim.value.reset(false);
    },
    onReset() {
      sim.value.reset();
    },
    onStep(cancelRemainingSteps) {
      const vsim = sim.value;
      const lastFrame = vsim.getCurrentFrame();
      let finished = vsim.step();
      if (!finished && pauseOnError.value) {
        const errors = vsim.findFrameVerificationErrors(lastFrame);
        if (errors.length > 0) {
          pause();
          cancelRemainingSteps();
        }
      }
      currentFrame.value = vsim.getCurrentFrame();
      return finished;
    },
    onAnim() {
      invokeStepAnimHandlers();
    },
    onComplete(isLooping) {
      if (isLooping) {
        if (currentFactory.value.regenOnLoop) {
          regenerateSequences();
        }
        invokeCompleteHandlers();
      } else {
        const verifyResult = sim.value.verify();
        invokeCompleteHandlers(verifyResult);
      }
    },
  });
  const {
    isRunning,
    isPaused,
    loop,
    stepRate,
    stepMode,
    stepsPerSecond,
    elapsedTime,
    realTimeTargetFrameRate,
    stop,
    pause,
    resume,
    step,
  } = timer;

  const handlers = {
    onStepAnim: [] as OnStepAnimHandler[],
    onComplete: [] as OnCompleteHandler[],
  };

  function invokeStepAnimHandlers() {
    handlers.onStepAnim.forEach((handler) => handler());
  }

  function invokeCompleteHandlers(result?: VerificationResult) {
    handlers.onComplete.forEach((handler) => handler(result));
  }

  function onStepAnim(handler: OnStepAnimHandler): () => void {
    handlers.onStepAnim.push(handler);
    const removeHandler = () => {
      const idx = handlers.onStepAnim.indexOf(handler);
      if (idx !== -1) {
        handlers.onStepAnim.splice(idx, 1);
      }
    };
    return removeHandler;
  }

  function onComplete(handler: OnCompleteHandler): () => void {
    handlers.onComplete.push(handler);
    const removeHandler = () => {
      const idx = handlers.onComplete.indexOf(handler);
      if (idx !== -1) {
        handlers.onComplete.splice(idx, 1);
      }
    };
    return removeHandler;
  }

  function load(simFactory: CircuitSimulationFactory = currentFactory.value) {
    if (isRunning.value) stop();
    const { setup } = (currentFactory.value = simFactory);
    const { field: fieldGraph } = field;
    network.value = Network.from(fieldGraph.value);
    sim.value = setup(network.value);
    name.value = simFactory.label ?? '';
  }

  function updateNetwork() {
    if (isRunning.value) stop();
    const { field: fieldGraph } = field;
    network.value = Network.from(fieldGraph.value);
    sim.value.setNetwork(network.value);
  }

  function regenerateSequences() {
    const regen = currentFactory.value.setup(network.value);
    const pins = network.value.getPinNodes();
    for (const pin of pins) {
      const { input, output } = regen.getPinSequence(pin);
      if (input) {
        sim.value.setInputSequence(pin, input.slice(0));
      }
      if (output) {
        sim.value.setOutputSequence(pin, output.slice(0));
      }
    }
  }

  function start(bUpdateNetwork = true) {
    if (bUpdateNetwork) updateNetwork();
    timer.start();
  }

  return {
    id: computed(() => id),
    name,
    sim,
    field,
    network,
    circuitFactory: currentFactory,
    levelInfo,
    timer,
    isRunning,
    isPaused,
    loop,
    pauseOnError,
    stepRate,
    stepMode,
    stepsPerSecond,
    elapsedTime: readonly(elapsedTime),
    currentFrame: readonly(currentFrame),
    realTimeTargetFrameRate,
    load,
    updateNetwork,
    regenerateSequences,
    start,
    stop,
    pause,
    resume,
    step,
    onStepAnim,
    onComplete,
  };
}

export type UseCircuitSimulationReturn = ReturnType<
  typeof useCircuitSimulation
>;

export function provideCircuitSimulation(
  circuitSim: ShallowRef<UseCircuitSimulationReturn>,
) {
  return provide('circuitSimulation', circuitSim);
}

export function injectCircuitSimulationOptional() {
  return inject<ShallowRef<UseCircuitSimulationReturn | undefined>>(
    'circuitSimulation',
  )!;
}

export function injectCircuitSimulation() {
  return inject<ShallowRef<UseCircuitSimulationReturn>>('circuitSimulation')!;
}
