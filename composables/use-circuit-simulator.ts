import { kohctpyktop } from "@/circuits/kohctpyktop";
import { CircuitSimulation, FieldGraph, Network } from "@/simulation";

export type OnRenderHandler = () => void;

const network = ref<Network>();
network.value = new Network();

const sim = ref<CircuitSimulation>();
sim.value = new CircuitSimulation(network.value);

const isRunning = ref(false);
const isPaused = ref(false);
const lastFrameTime = ref(0);
const accumulatedTime = ref(0);
const stepsPerSecond = ref(40);
const stepInterval = computed(() => 1000 / stepsPerSecond.value);
const onRenderHandlers: OnRenderHandler[] = [];

export type SimLoader = (network: Network) => CircuitSimulation;
let currentSimLoader: SimLoader = (network: Network) => new CircuitSimulation(network);

const invokeRenderers = () => {
  onRenderHandlers.forEach(handler => handler());
}

const load = (field: FieldGraph, simLoader: SimLoader = currentSimLoader) => {
  currentSimLoader = simLoader;
  network.value = Network.from(field);
  sim.value = currentSimLoader(network.value);
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
      if (sim.value.step()) {
        stop();
      }
      accumulatedTime.value -= stepInterval.value;
      stepped = true;
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
  isRunning.value = true;
  isPaused.value = false;
  lastFrameTime.value = performance.now();
  accumulatedTime.value = 0;
  sim.value.reset();
  requestAnimationFrame(onAnim);
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

  const removeRenderHandler = () => {
    if (onRenderHandler) {
      onRenderHandlers.splice(onRenderHandlers.indexOf(onRenderHandler), 1);
    }
  }

  const onRender = (handler: OnRenderHandler): (() => void) => {
    removeRenderHandler();
    onRenderHandler = handler;
    onRenderHandlers.push(handler);
    return removeRenderHandler;
  }

  onUnmounted(removeRenderHandler);

  return {
    sim,
    network,
    isRunning,
    isPaused,
    stepsPerSecond,
    load,
    start,
    stop,
    pause,
    resume,
    step,
    onRender,
  };
}