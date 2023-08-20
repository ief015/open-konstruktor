<template>
  <div class="flex flex-row items-center gap-2 px-2">
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
      <button @click="onStep()">Step +1</button>
    </div>
    <div>
      <button @click="onStep(10)">+10</button>
    </div>
    <div>
      <select v-model="selectedRate">
        <option value="10">10 Hz</option>
        <option value="20">20 Hz</option>
        <option value="40">40 Hz (Classic)</option>
        <option value="60">60 Hz</option>
        <option value="120">120 Hz</option>
        <option value="144">144 Hz</option>
        <option value="1000">1000 Hz</option>
        <option value="vsync">V-Sync</option>
        <option value="realtime">Real-time</option>
        <option value="custom">-- Custom --</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">

const { field } = useFieldGraph();
const {
  sim, isRunning, isPaused, stepsPerSecond,
  load, start, stop, pause, resume, step,
} = useCircuitSimulator();

const selectedRate = ref('40');

watch(selectedRate, (rate) => {
  if (rate === 'custom') {
    // TODO: not yet implemented
    console.warn('Custom not yet implemented');
    stepsPerSecond.value = 5;
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
  load(field.value)
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
