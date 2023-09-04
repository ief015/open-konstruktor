<template>
  <div class="flex flex-row items-baseline gap-2 px-2">
    <div>
      <button v-if="!isRunning" @click="onStart">
        Start
      </button>
      <button v-else @click="stop">
        Stop
      </button>
    </div>
    <div>
      <button @click="onTogglePause">
        {{ isPaused && isRunning ? 'Resume' : 'Pause' }}
      </button>
    </div>
    <div>
      <button @click="onStep()">Step+1</button>
    </div>
    <div>
      <button @click="onStep(10)">+10</button>
    </div>
    <div class="flex flex-row items-center text-sm">
      <label for="circuit-controls-loop-checkbox">Loop</label>
      <input id="circuit-controls-loop-checkbox" type="checkbox" v-model="loop" />
    </div>
    <div>
      <select v-model="selectedRate">
        <option value="10">10 Hz</option>
        <option value="20">20 Hz</option>
        <option value="40">40 Hz (Classic)</option>
        <option value="60">60 Hz</option>
        <option value="72">72 Hz</option>
        <option value="120">120 Hz</option>
        <option value="144">144 Hz</option>
        <option value="1000">1000 Hz</option>
        <option value="vsync">V-Sync</option>
        <option value="realtime">Real-time</option>
        <option value="custom">-- Custom --</option>
      </select>
    </div>
    <div v-if="selectedRate == 'custom'" class="flex flex-row items-center text-sm gap-1">
      <input id="circuit-controls-custom-rate" class="w-[5em]" placeholder="Hz" type="number" min="0" v-model="customRate" />
      <label for="circuit-controls-custom-rate">Hz</label>
    </div>
  </div>
</template>

<script setup lang="ts">

const { field } = useFieldGraph();
const {
  sim, isRunning, isPaused, stepsPerSecond, loop,
  load, start, stop, pause, resume, step,
} = useCircuitSimulator();
const customRate = ref(40);
const selectedRate = ref('40');

watch(customRate, (rate) => {
  if (selectedRate.value === 'custom') {
    stepsPerSecond.value = Math.max(0, rate);
  }
});

watch(selectedRate, (rate) => {
  if (rate === 'custom') {
    stepsPerSecond.value = Math.max(0, customRate.value);
    return;
  }
  if (rate === 'realtime') {
    // TODO: not yet implemented
    console.warn('Real-time not yet implemented');
    stepsPerSecond.value = 1000000;
    return;
  }
  if (rate === 'vsync') {
    // TODO: not yet implemented
    console.warn('V-Sync not yet implemented');
    stepsPerSecond.value = 60;
    return;
  }
  stepsPerSecond.value = parseInt(rate);
}, { immediate: true });

const onStart = () => {
  if (isRunning.value) return;
  if (!field.value) return;
  load(field.value);
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
  step(n);
}

</script>
