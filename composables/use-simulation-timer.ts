export interface SimulationTimerEvents {
  onStart?: () => void;
  onStep?: () => boolean;
  onAnim?: () => void;
  onReset?: () => void;
  onComplete?: () => void;
}

export type StepMode = 'fixed' | 'vsync' | 'realtime';

export function useSimulationTimer(events: SimulationTimerEvents = {}) {
  const { onStart, onStep, onAnim, onReset, onComplete } = events;

  let lastFrameTime = 0;
  let accumulatedTime = 0;

  const profiler = reactive({
    steps: 0,
    elapsed: 0,
  });

  const isRunning = ref(false);
  const isPaused = ref(false);
  const loop = ref(false);
  const stepMode = ref<StepMode>('fixed');
  const stepRate = ref(40);
  const elapsedTime = ref(0);
  const realTimeTargetFrameRate = ref(60);
  const realTimeTargetFrameInterval = computed(
    () => 1000 / realTimeTargetFrameRate.value,
  );
  const stepsPerSecond = computed(
    () => (profiler.steps / profiler.elapsed) * 1000,
  );
  const stepInterval = computed(() =>
    stepMode.value !== 'realtime' ? 1000 / stepRate.value : 0,
  );

  function resetProfiler() {
    profiler.steps = 0;
    profiler.elapsed = 0;
  }

  function start() {
    isRunning.value = true;
    isPaused.value = false;
    lastFrameTime = performance.now();
    elapsedTime.value = 0;
    accumulatedTime = 0;
    resetProfiler();
    onStart?.();
    requestAnimationFrame(anim);
  }

  function pause() {
    isPaused.value = true;
  }

  function resume() {
    isPaused.value = false;
    lastFrameTime = performance.now();
  }

  function stop() {
    isRunning.value = false;
    isPaused.value = true;
    accumulatedTime = 0;
    onReset?.();
  }

  function step(n = 1, bInvokeStepAnimHandlers = true) {
    if (!isRunning.value) return true;
    let endReached = false;
    for (let i = 0; i < n; i++) {
      if ((endReached = onStep?.() ?? true)) {
        if (loop.value) {
          onComplete?.();
          onReset?.();
          endReached = false;
        } else {
          onComplete?.();
          stop();
          break;
        }
      }
    }
    bInvokeStepAnimHandlers && onAnim?.();
    return endReached;
  }

  function anim(timestamp: number) {
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
        onAnim?.();
      }
    }
    requestAnimationFrame(anim);
  }

  return {
    isRunning,
    isPaused,
    loop,
    stepRate,
    stepMode,
    stepsPerSecond,
    elapsedTime: readonly(elapsedTime),
    realTimeTargetFrameRate,
    start,
    stop,
    pause,
    resume,
  };
}
