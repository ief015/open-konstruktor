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
  let lastFrameTime = 0;
  let accumulatedTime = 0;
  const profiler = reactive({
    steps: 0,
    elapsed: 0,
  });

  const id = nextID++;
  const network = shallowRef<Network>(new Network());
  const sim = shallowRef<CircuitSimulation>(
    new CircuitSimulation(network.value),
  );
  const field = useFieldGraph();
  const isRunning = ref(false);
  const isPaused = ref(false);
  const loop = ref(false);
  const pauseOnError = ref(false);
  const stepMode = ref<StepMode>('fixed');
  const stepRate = ref(40);
  const currentFrame = ref(0);
  const elapsedTime = ref(0);
  const realTimeTargetFrameRate = ref(60);
  const realTimeTargetFrameInterval = computed(
    () => 1000 / realTimeTargetFrameRate.value,
  );
  const stepsPerSecond = computed(() => {
    return (profiler.steps / profiler.elapsed) * 1000;
  });
  const stepInterval = computed(() => {
    if (stepMode.value === 'realtime') {
      return 0;
    } else {
      return 1000 / stepRate.value;
    }
  });

  const defaultFactory: CircuitSimulationFactory = {
    key: '',
    setup: (network) => new CircuitSimulation(network),
  };
  const currentFactory = shallowRef<CircuitSimulationFactory>(defaultFactory);

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

  function resetProfiler() {
    profiler.steps = 0;
    profiler.elapsed = 0;
  }

  function stop() {
    isRunning.value = false;
    isPaused.value = true;
    accumulatedTime = 0;
    currentFrame.value = 0;
    sim.value.reset(false);
  }

  function pause() {
    isPaused.value = true;
  }

  function resume() {
    isPaused.value = false;
    lastFrameTime = performance.now();
  }

  function start(bUpdateNetwork = true) {
    if (bUpdateNetwork) updateNetwork();
    sim.value.reset();
    isRunning.value = true;
    isPaused.value = false;
    lastFrameTime = performance.now();
    currentFrame.value = 0;
    elapsedTime.value = 0;
    accumulatedTime = 0;
    resetProfiler();
    requestAnimationFrame(onAnim);
  }

  function step(n = 1, bInvokeStepAnimHandlers = true) {
    if (!isRunning.value) return true;
    const vsim = sim.value;
    let endReached = false;
    for (let i = 0; i < n; i++) {
      if ((endReached = vsim.step())) {
        if (loop.value) {
          vsim.reset();
          invokeCompleteHandlers();
          endReached = false;
          if (currentFactory.value.regenOnLoop) {
            regenerateSequences();
          }
        } else {
          const verifyResult = vsim.verify();
          invokeCompleteHandlers(verifyResult);
          stop();
          break;
        }
      } else {
        if (pauseOnError.value) {
          const errors = vsim.findFrameVerificationErrors(
            vsim.getCurrentFrame() - 1,
          );
          if (errors.length > 0) {
            pause();
            endReached = true;
            break;
          }
        }
      }
    }
    currentFrame.value = vsim.getCurrentFrame();
    bInvokeStepAnimHandlers && invokeStepAnimHandlers();
    return endReached;
  }

  function onAnim(timestamp: number) {
    if (!isRunning.value) return;
    if (!isPaused.value) {
      const isRealTime = stepMode.value === 'realtime';
      const dt = timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      elapsedTime.value += dt;
      profiler.elapsed += dt;
      if (isRealTime) {
        accumulatedTime += realTimeTargetFrameInterval.value;
      } else if (stepMode.value === 'vsync') {
        // Always step only once per animation frame
        accumulatedTime = stepInterval.value;
      } else {
        accumulatedTime += dt;
      }
      const interval = isRealTime ? 0 : stepInterval.value;
      const cutoff = performance.now() + 100;
      const willStep = accumulatedTime >= interval;
      while (accumulatedTime >= interval) {
        const ts = isRealTime ? performance.now() : 0;
        profiler.steps++;
        if (step(1, false)) {
          break;
        }
        const now = performance.now();
        if (isRealTime) {
          const elapsed = now - ts;
          accumulatedTime -= elapsed;
        } else {
          accumulatedTime -= interval;
        }
        if (now > cutoff) {
          accumulatedTime = -Number.EPSILON;
        }
      }
      if (willStep) {
        invokeStepAnimHandlers();
      }
    }
    requestAnimationFrame(onAnim);
  }

  return {
    id: computed(() => id),
    sim,
    field,
    network,
    circuitFactory: currentFactory,
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
    resetProfiler,
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
