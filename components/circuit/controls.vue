<template>
  <div class="flex flex-row items-baseline gap-2 px-2">
    <div>
        <svg
          viewBox="0 0 1 1"
          class="w-[0.5em] h-[0.5em]"
          :class="{
            'green-light': isRunning && !isPaused,
            'yellow-light': isRunning && isPaused,
            'red-light': !isRunning,
          }"
        >
          <circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />
        </svg>
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
      <button
        @click="onStep()"
        :disabled="!isPaused"
        title="Step 1 cycle."
      >
        Step+1
      </button>
    </div>
    <div>
      <button
        @click="onStep(5)"
        :disabled="!isPaused"
        title="Step 5 cycles."
      >
        +5
      </button>
    </div>
    <div>
      <button
        @click="onStep(10)"
        :disabled="!isPaused"
        title="Step 10 cycles."
      >
        +10
      </button>
    </div>
    <div class="flex flex-row items-center text-sm" title="Toggle looping.">
      <label for="circuit-controls-loop-checkbox">Loop</label>
      <input id="circuit-controls-loop-checkbox" type="checkbox" v-model="loop" />
    </div>
    <div>
      <select v-model="selectedRate" title="Set the step rate of the simulation.">
        <option value="10">10 Hz</option>
        <option value="20">20 Hz</option>
        <option value="40" title="The original step rate of KOHCTPYKTOP.">
          40 Hz (Classic)
        </option>
        <option value="60">60 Hz</option>
        <option value="100">100 Hz</option>
        <option value="500">500 Hz</option>
        <option value="1000">1000 Hz</option>
        <option value="vsync" title="The simulation will advance only once per animation frame.">
          V-Sync
        </option>
        <option
          value="realtime"
          title="The simulation will advance as often as it can between target frame intervals. High power consumption."
        >
          Real-time
        </option>
        <option value="custom" title="Set a custom step rate.">
          Custom
        </option>
      </select>
    </div>
    <div v-if="selectedRate == 'custom'" class="flex flex-row items-center text-sm gap-1">
      <input id="circuit-controls-custom-rate" class="w-[5em]" placeholder="Hz" type="number" min="0" v-model="customRate" />
      <label for="circuit-controls-custom-rate">Hz</label>
    </div>
    <div v-if="selectedRate == 'realtime'" class="flex flex-row items-center text-sm gap-1">
      <input id="circuit-controls-realtime-rate" class="w-[5em]" placeholder="Hz" type="number" min="1" v-model="realtimeRate" />
      <label for="circuit-controls-realtime-rate">FPS</label>
    </div>
  </div>
</template>

<script setup lang="ts">

const { field } = useFieldGraph();
const {
  isRunning, isPaused, stepRate, realTimeTargetFrameRate, stepMode, loop,
  start, stop, pause, resume, step, resetProfiler, updateField,
} = useCircuitSimulator();
const customRate = ref(40);
const realtimeRate = ref(60);
const selectedRate = ref('40');

watchDebounced(customRate, (rate) => {
  if (selectedRate.value === 'custom') {
    stepRate.value = Math.max(0, rate);
  }
  resetProfiler();
}, { debounce: 500 });

watchDebounced(realtimeRate, (rate) => {
  if (selectedRate.value === 'realtime') {
    realTimeTargetFrameRate.value = Math.max(1, rate);
  }
  resetProfiler();
}, { debounce: 500 });

watch(selectedRate, (rate) => {
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
  resetProfiler();
}, { immediate: true });

const onStart = () => {
  if (isRunning.value) return;
  updateField(field.value);
  start();
}

const onTogglePause = () => {
  if (!isRunning.value) {
    onStart();
    pause();
    return;
  }
  if (isPaused.value) {
    resume();
  } else {
    pause();
  }
}

const onStep = (n?: number) => {
  if (!isRunning.value) {
    onStart();
    pause();
  }
  if (isPaused.value) {
    step(n);
  }
}

</script>

<style scoped>

.green-light {
  color: #4ae681;
  filter: drop-shadow(0 0 0.25em #4ae681);
}
.yellow-light {
  color: #f7d82b;
  filter: drop-shadow(0 0 0.25em #f7d82b);
}
.red-light {
  color: #f63535;
  filter: drop-shadow(0 0 0.25em #f63535);
}

</style>