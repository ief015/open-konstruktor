<template>
  <div class="flex flex-row items-baseline gap-2 px-2">
    <div>
      <CircuitStatusLight :isRunning :isPaused />
    </div>
    <div>
      <button
        v-if="!isRunning"
        @click="onStart"
        class="w-[5em] overflow-hidden"
        title="Start the verification test."
      >
        Start
      </button>
      <button
        v-else
        @click="stop"
        class="w-[5em] overflow-hidden"
        title="Stop the verification test."
      >
        Stop
      </button>
    </div>
    <div>
      <button
        @click="onTogglePause"
        class="w-[5em] overflow-hidden"
        title="Toggle pause/resume."
      >
        {{ isPaused && isRunning ? 'Resume' : 'Pause' }}
      </button>
    </div>
    <div>
      <button @click="onStep()" :disabled="!isPaused" title="Step 1 cycle.">
        Step+1
      </button>
    </div>
    <div>
      <button @click="onStep(5)" :disabled="!isPaused" title="Step 5 cycles.">
        +5
      </button>
    </div>
    <div>
      <button @click="onStep(10)" :disabled="!isPaused" title="Step 10 cycles.">
        +10
      </button>
    </div>
    <div
      class="flex flex-row items-center text-sm"
      title="Toggle looping. Verification testing will not be completed until disabled or stopped."
    >
      <label for="circuit-controls-loop-checkbox">Loop</label>
      <input
        id="circuit-controls-loop-checkbox"
        type="checkbox"
        v-model="loop"
      />
    </div>
    <div
      class="flex flex-row items-center text-sm"
      title="Verification testing will pause when an error is detected."
    >
      <label for="circuit-controls-error-pause-checkbox">Pause on Error</label>
      <input
        id="circuit-controls-error-pause-checkbox"
        type="checkbox"
        v-model="pauseOnError"
      />
    </div>
    <div title="Set the step rate of the simulation.">
      <select v-model="currentState.selectedRate">
        <option value="10">10 Hz</option>
        <option value="20">20 Hz</option>
        <option value="40" title="The original step rate of KOHCTPYKTOP.">
          40 Hz (Classic)
        </option>
        <option value="60">60 Hz</option>
        <option value="100">100 Hz</option>
        <option value="500">500 Hz</option>
        <option value="1000">1000 Hz</option>
        <option
          value="vsync"
          title="The simulation will advance only once per animation frame."
        >
          V-Sync
        </option>
        <option
          value="realtime"
          title="The simulation will advance as often as it can between target frame intervals. High power consumption."
        >
          Real-time
        </option>
        <option value="custom" title="Set a custom step rate.">Custom</option>
      </select>
    </div>
    <div
      v-if="currentState.selectedRate == 'custom'"
      class="flex flex-row items-center gap-1"
    >
      <input
        id="circuit-controls-custom-rate"
        class="w-[5em]"
        placeholder="Hz"
        type="number"
        min="0"
        v-model="currentState.customRate"
        title="Set the target step rate."
      />
      <label for="circuit-controls-custom-rate">Hz</label>
    </div>
    <div
      v-if="currentState.selectedRate == 'realtime'"
      class="flex flex-row items-center gap-1"
      title="Set the target frame rate for real-time mode."
    >
      <input
        id="circuit-controls-realtime-rate"
        class="w-[5em]"
        placeholder="Hz"
        type="number"
        min="1"
        v-model="currentState.realtimeRate"
      />
      <label for="circuit-controls-realtime-rate">FPS</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UseCircuitSimulationReturn } from '@/composables/use-circuit-simulation';

const circuitSimulation = injectCircuitSimulation();
const {
  id: simId,
  isRunning,
  isPaused,
  stepRate,
  realTimeTargetFrameRate,
  stepMode,
  loop,
  pauseOnError,
  start,
  stop,
  pause,
  resume,
  step,
  timer,
} = toShallowRefs(circuitSimulation);

function useControlsState(sim: UseCircuitSimulationReturn) {
  const customRate = ref(40);
  const realtimeRate = ref(60);
  const selectedRate = ref('40');

  const customRateWatcher = watchDebounced(
    customRate,
    (rate) => {
      if (selectedRate.value === 'custom') {
        stepRate.value = Math.max(0, rate);
      }
      timer.value.resetProfiler();
    },
    { debounce: 500 },
  );

  const realtimeRateWatcher = watchDebounced(
    realtimeRate,
    (rate) => {
      if (selectedRate.value === 'realtime') {
        realTimeTargetFrameRate.value = Math.max(1, rate);
      }
      timer.value.resetProfiler();
    },
    { debounce: 500 },
  );

  const selectedRateWatcher = watch(
    selectedRate,
    (rate) => {
      switch (rate) {
        default:
          stepRate.value = Math.max(0, parseInt(rate));
          stepMode.value = 'fixed';
          break;
        case 'vsync':
          stepMode.value = 'vsync';
          break;
        case 'realtime':
          stepMode.value = 'realtime';
          break;
        case 'custom':
          stepRate.value = Math.max(0, customRate.value);
          stepMode.value = 'fixed';
          break;
      }
      timer.value.resetProfiler();
    },
    { immediate: true },
  );

  function dispose() {
    customRateWatcher();
    realtimeRateWatcher();
    selectedRateWatcher();
  }

  return reactive({
    customRate,
    realtimeRate,
    selectedRate,
    dispose,
  });
}

const stateMap = new Map<number, ReturnType<typeof useControlsState>>();

useWorkspaceActionListener((event) => {
  const { action, simulation } = event;
  switch (action) {
    case 'simulation-deleted':
      if (simulation) {
        const state = stateMap.get(simulation.id.value);
        if (state) {
          state.dispose();
          stateMap.delete(simulation.id.value);
        }
      }
      break;
  }
});

const currentState = computed(() => {
  const id = simId.value;
  if (!stateMap.has(id)) {
    stateMap.set(id, useControlsState(circuitSimulation.value));
  }
  return stateMap.get(id)!;
});

function onStart() {
  if (isRunning.value) return;
  start.value();
}

function onTogglePause() {
  if (!isRunning.value) {
    onStart();
    pause.value();
    return;
  }
  if (isPaused.value) {
    resume.value();
  } else {
    pause.value();
  }
}

function onStep(n?: number) {
  if (!isRunning.value) {
    onStart();
    pause.value();
  }
  if (isPaused.value) {
    step.value(n);
  }
}
</script>
