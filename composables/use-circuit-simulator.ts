import { CircuitSimulation, FieldGraph, Network, VerificationResult } from "@/simulation";

export type OnPostStepHandler = () => void;
export type OnCompleteHandler = (result: VerificationResult) => void;

const network = ref<Network>();
network.value = new Network();

const sim = ref<CircuitSimulation>();
sim.value = new CircuitSimulation(network.value);

const isRunning = ref(false);
const isPaused = ref(false);
const lastFrameTime = ref(0);
const accumulatedTime = ref(0);
const stepsPerSecond = ref(40);
const loop = ref(false);
const stepInterval = computed(() => 1000 / stepsPerSecond.value);
const onPostStepHandlers: OnPostStepHandler[] = [];
const onCompleteHandlers: OnCompleteHandler[] = [];

export type SimLoader = (network: Network) => CircuitSimulation;
let currentSimLoader: SimLoader = (network: Network) => new CircuitSimulation(network);

const invokePostStepHandlers = () => {
  onPostStepHandlers.forEach(handler => handler());
}

const invokeCompleteHandlers = (result: VerificationResult) => {
  onCompleteHandlers.forEach(handler => handler(result));
}

const stop = () => {
  if (!sim.value)
    return;
  isRunning.value = false;
  isPaused.value = true;
  accumulatedTime.value = 0;
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
    accumulatedTime.value += dt;
    let stepped = false;
    while (accumulatedTime.value >= stepInterval.value) {
      stepped = true;
      if (sim.value.step()) {
        const verifyResult = sim.value.verify('kohctpyktop');
        stop();
        invokeCompleteHandlers(verifyResult);
        if (loop.value) {
          start();
          return
        } else {
          break;
        }
      }
      accumulatedTime.value -= stepInterval.value;
    }
    if (stepped) {
      invokePostStepHandlers();
    }
  }
  requestAnimationFrame(onAnim);
}

const start = () => {
  if (!sim.value)
    return;
  isRunning.value = true;
  isPaused.value = false;
  lastFrameTime.value = performance.now();
  accumulatedTime.value = 0;
  sim.value.reset();
  requestAnimationFrame(onAnim);
}

const load = (field: FieldGraph, simLoader: SimLoader = currentSimLoader) => {
  stop();
  currentSimLoader = simLoader;
  network.value = Network.from(field);
  sim.value = currentSimLoader(network.value);
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
  invokePostStepHandlers();
}

export default function useCircuitSimulator() {

  let onPostStepHandler: OnPostStepHandler|null = null;
  let onCompleteHandler: OnCompleteHandler|null = null;

  const removePostStepHandler = () => {
    if (onPostStepHandler) {
      onPostStepHandlers.splice(onPostStepHandlers.indexOf(onPostStepHandler), 1);
    }
  }

  const removeCompleteHandler = () => {
    if (onCompleteHandler) {
      onCompleteHandlers.splice(onCompleteHandlers.indexOf(onCompleteHandler), 1);
    }
  }

  const onPostStep = (handler: OnPostStepHandler): (() => void) => {
    removePostStepHandler();
    onPostStepHandler = handler;
    onPostStepHandlers.push(handler);
    return removePostStepHandler;
  }

  const onComplete = (handler: OnCompleteHandler): (() => void) => {
    removeCompleteHandler();
    onCompleteHandler = handler;
    onCompleteHandlers.push(handler);
    return removeCompleteHandler;
  }

  onUnmounted(removePostStepHandler);
  onUnmounted(removeCompleteHandler);

  return {
    sim,
    network,
    isRunning,
    isPaused,
    stepsPerSecond,
    loop,
    load,
    start,
    stop,
    pause,
    resume,
    step,
    onPostStep,
    onComplete,
  };
}