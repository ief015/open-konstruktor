import type { CircuitSimulationFactory } from "@/circuits";
import { CircuitSimulation, FieldGraph, Network } from "@/simulation";
import type { VerificationResult } from "@/simulation";

export type OnRenderHandler = () => void;
export type OnCompleteHandler = (result?: VerificationResult) => void;

export type StepMode = 'fixed' | 'vsync' | 'realtime';

let lastFrameTime = 0;
let accumulatedTime = 0;
const profiler = reactive({
  steps: 0,
  elapsed: 0,
});
const network = shallowRef<Network>(new Network());
const sim = shallowRef<CircuitSimulation>(new CircuitSimulation(network.value));
const isRunning = ref(false);
const isPaused = ref(false);
const loop = ref(false);
const pauseOnError = ref(false);
const stepMode = ref<StepMode>('fixed');
const stepRate = ref(40);
const currentFrame = ref(0);
const elapsedTime = ref(0);
const realTimeTargetFrameRate = ref(60);
const realTimeTargetFrameInterval = computed(() => 1000 / realTimeTargetFrameRate.value);
const stepsPerSecond = computed(() => {
  return profiler.steps / profiler.elapsed * 1000;
});
const stepInterval = computed(() => {
  if (stepMode.value == 'realtime') {
    return 0;
  } else {
    return 1000 / stepRate.value;
  }
});
const onRenderHandlers: OnRenderHandler[] = [];
const onCompleteHandlers: OnCompleteHandler[] = [];

const defaultFactory: CircuitSimulationFactory = { setup: (network) => new CircuitSimulation(network) };
const currentFactory = shallowRef<CircuitSimulationFactory>(defaultFactory);

const invokeRenderers = () => {
  onRenderHandlers.forEach(handler => handler());
}

const invokeCompleteHandlers = (result?: VerificationResult) => {
  onCompleteHandlers.forEach(handler => handler(result));
}

const resetProfiler = () => {
  profiler.steps = 0;
  profiler.elapsed = 0;
}

const stop = () => {
  isRunning.value = false;
  isPaused.value = true;
  accumulatedTime = 0;
  currentFrame.value = 0;
  sim.value.reset(false);
}

const pause = () => {
  isPaused.value = true;
}

const resume = () => {
  isPaused.value = false;
  lastFrameTime = performance.now();
}

const onAnim = (timestamp: number) => {
  if (!isRunning.value) return;
  if (!isPaused.value) {
    const isRealTime = stepMode.value == 'realtime';
    const dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    elapsedTime.value += dt;
    profiler.elapsed += dt;
    if (isRealTime) {
      accumulatedTime += realTimeTargetFrameInterval.value;
    } else if (stepMode.value == 'vsync') {
      // Always step only once per animation frame
      accumulatedTime = stepInterval.value;
    } else {
      accumulatedTime += dt;
    }
    let stepped = false;
    const interval = isRealTime ? 0 : stepInterval.value;
    while (accumulatedTime >= interval) {
      const ts = isRealTime ? performance.now() : 0;
      profiler.steps++;
      stepped = true;
      if (step(1, false)) {
        break;
      }
      if (isRealTime) {
        const elapsed = performance.now() - ts;
        accumulatedTime -= elapsed;
      } else {
        accumulatedTime -= stepInterval.value;
      }
    }
    if (stepped) {
      invokeRenderers();
    }
  }
  requestAnimationFrame(onAnim);
}

const start = () => {
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

const load = (field: FieldGraph, simFactory: CircuitSimulationFactory = currentFactory.value) => {
  stop();
  const { setup } = (currentFactory.value = simFactory);
  network.value = Network.from(field);
  sim.value = setup(network.value);
}

const updateField = (field: FieldGraph) => {
  stop();
  network.value = Network.from(field);
  sim.value.setNetwork(network.value);
}

const regenerateSequences = () => {
  const regen = currentFactory.value.setup(network.value);
  const pins = network.value.getPinNodes();
  for (const pin of pins) {
    const { input, output } = regen.getSequence(pin);
    if (input) {
      sim.value.setInputSequence(pin, input.slice(0));
    }
    if (output) {
      sim.value.setOutputSequence(pin, output.slice(0));
    }
  }
}

const step = (n = 1, bInvokeRenderers = true) => {
  if (!isRunning.value) return true;
  const vsim = sim.value;
  let endReached = false;
  for (let i = 0; i < n; i++) {
    if (endReached = vsim.step()) {
      if (loop.value) {
        vsim.reset();
        invokeCompleteHandlers();
        endReached = false;
        if (currentFactory.value.regenOnLoop) {
          regenerateSequences();
        }
      } else {
        const verifyResult = vsim.verify('kohctpyktop');
        invokeCompleteHandlers(verifyResult);
        stop();
        break;
      }
    } else {
      if (pauseOnError.value) {
        const errors = vsim.findFrameVerificationErrors(vsim.getCurrentFrame() - 1);
        if (errors.length > 0) {
          pause();
          endReached = true;
          break;
        }
      }
    }
  }
  currentFrame.value = vsim.getCurrentFrame();
  bInvokeRenderers && invokeRenderers();
  return endReached;
}

export default function useCircuitSimulator() {

  let onRenderHandler: OnRenderHandler|null = null;
  let onCompleteHandler: OnCompleteHandler|null = null;

  const removeRenderHandler = () => {
    if (onRenderHandler) {
      onRenderHandlers.splice(onRenderHandlers.indexOf(onRenderHandler), 1);
    }
  }

  const removeCompleteHandler = () => {
    if (onCompleteHandler) {
      onCompleteHandlers.splice(onCompleteHandlers.indexOf(onCompleteHandler), 1);
    }
  }

  const onRender = (handler: OnRenderHandler): (() => void) => {
    removeRenderHandler();
    onRenderHandler = handler;
    onRenderHandlers.push(handler);
    return removeRenderHandler;
  }

  const onComplete = (handler: OnCompleteHandler): (() => void) => {
    removeCompleteHandler();
    onCompleteHandler = handler;
    onCompleteHandlers.push(handler);
    return removeCompleteHandler;
  }

  // TODO: causing warns - use-level-info.ts calls this outside of component
  onUnmounted(stop);
  onUnmounted(removeRenderHandler);
  onUnmounted(removeCompleteHandler);

  return {
    sim,
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
    updateField,
    regenerateSequences,
    start,
    stop,
    pause,
    resume,
    step,
    resetProfiler,
    onRender,
    onComplete,
  };
}