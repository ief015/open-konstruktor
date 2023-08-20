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
      <select>
        <option>10 Hz</option>
        <option>20 Hz</option>
        <option>40 Hz</option>
        <option>60 Hz</option>
        <option>1000 Hz</option>
        <option>V-Sync</option>
        <option>Real-time</option>
        <option>-- Custom --</option>
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
