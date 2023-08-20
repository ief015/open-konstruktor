import { kohctpyktop } from "@/circuits/kohctpyktop";
import { CircuitSimulation, FieldGraph, Network } from "@/simulation";

export type RenderCallback = () => void;

const sim = ref<CircuitSimulation>();
const network = ref<Network>();
const isRunning = ref(false);
const isPaused = ref(false);
const lastFrameTime = ref(0);
const accumulatedTime = ref(0);
const stepsPerSecond = ref(40);
const stepInterval = computed(() => 1000 / stepsPerSecond.value);
const onRenderHandlers: RenderCallback[] = [];

const invokeRenderers = () => {
  onRenderHandlers.forEach(handler => handler());
}

const load = (field: FieldGraph) => {
  network.value = Network.from(field);
  sim.value = kohctpyktop['15 KR8S1 8-BIT ADDRESSABLE SRAM'](network.value);
  //sim.value = new CircuitSimulation(network.value);
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
  // requestAnimationFrame(onAnim);
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

  let onRenderHandler: RenderCallback|null = null;

  const removeRenderHandler = () => {
    if (onRenderHandler) {
      onRenderHandlers.splice(onRenderHandlers.indexOf(onRenderHandler), 1);
    }
  }

  const onRender = (handler: RenderCallback): (() => void) => {
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