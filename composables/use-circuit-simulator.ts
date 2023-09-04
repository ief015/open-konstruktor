import { CircuitSimulationFactory } from "@/circuits";
import { CircuitSimulation, FieldGraph, Network, VerificationResult } from "@/simulation";

export type OnRenderHandler = () => void;
export type OnCompleteHandler = (result: VerificationResult) => void;

export type StepMode = 'fixed' | 'vsync' | 'realtime';

const network = ref<Network>();
network.value = new Network();

const sim = ref<CircuitSimulation>();
sim.value = new CircuitSimulation(network.value);

let accumulatedTime = 0;
const profiler = reactive({
  steps: 0,
  elapsed: 0,
});

const isRunning = ref(false);
const isPaused = ref(false);
const lastFrameTime = ref(0);
const loop = ref(false);
const stepMode = ref<StepMode>('fixed');
const stepRate = ref(40);
const stepCounter = ref(0);
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
const currentFactory = ref<CircuitSimulationFactory>(defaultFactory);

const invokeRenderers = () => {
  onRenderHandlers.forEach(handler => handler());
}

const invokeCompleteHandlers = (result: VerificationResult) => {
  onCompleteHandlers.forEach(handler => handler(result));
}

const resetProfiler = () => {
  profiler.steps = 0;
  profiler.elapsed = 0;
}

const stop = () => {
  if (!sim.value)
    return;
  isRunning.value = false;
  isPaused.value = true;
  accumulatedTime = 0;
  sim.value.reset(false);
}

const pause = () => {
  isPaused.value = true;
}

const resume = () => {
  isPaused.value = false;
  lastFrameTime.value = performance.now();
}

const onAnim = (timestamp: number) => {
  if (!sim.value) return;
  if (!isRunning.value) return;
  if (!isPaused.value) {
    const dt = timestamp - lastFrameTime.value;
    lastFrameTime.value = timestamp;
    elapsedTime.value += dt;
    profiler.elapsed += dt;
    if (stepMode.value == 'vsync') {
      // Always step only once per animation frame
      accumulatedTime = stepInterval.value;
    } else if (stepMode.value == 'realtime') {
      accumulatedTime += realTimeTargetFrameInterval.value;
    } else {
      accumulatedTime += dt;
    }
    let stepped = false;
    const isRealTime = stepMode.value == 'realtime';
    const interval = isRealTime ? 0 : stepInterval.value;
    while (accumulatedTime >= interval) {
      const ts = isRealTime ? performance.now() : 0;
      stepCounter.value++;
      profiler.steps++;
      stepped = true;
      if (sim.value.step()) {
        const verifyResult = sim.value.verify('kohctpyktop');
        invokeCompleteHandlers(verifyResult);
        if (loop.value) {
          sim.value.reset();
        } else {
          stop();
          break;
        }
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
  if (!sim.value)
    return;
  sim.value.reset();
  isRunning.value = true;
  isPaused.value = false;
  lastFrameTime.value = performance.now();
  stepCounter.value = 0;
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

const step = (n: number = 1) => {
  if (!sim.value) return;
  if (!isRunning.value) return;
  if (!isPaused.value) return;
  for (let i = 0; i < n; i++) {
    if (sim.value.step()) {
      stop();
      break;
    }
  }
  invokeRenderers();
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

  onUnmounted(stop);
  onUnmounted(removeRenderHandler);
  onUnmounted(removeCompleteHandler);

  return {
    sim,
    network,
    circuitFactory: readonly(currentFactory),
    isRunning,
    isPaused,
    loop,
    stepRate,
    stepMode,
    stepsPerSecond,
    stepCounter: readonly(stepCounter),
    elapsedTime: readonly(elapsedTime),
    realTimeTargetFrameRate,
    load,
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