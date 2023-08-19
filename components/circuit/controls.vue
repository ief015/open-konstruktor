<template>
  <div class="flex flex-row items-center gap-2 px-2">
    <div>
      <button @click="onStart">Start</button>
    </div>
    <div>
      <button>Pause</button>
    </div>
    <div>
      <button>Step +1</button>
    </div>
    <div>
      <button>+10</button>
    </div>
    <div>
      <select>
        <option>10 Hz</option>
        <option>20 Hz</option>
        <option>40 Hz</option>
        <option>60 Hz</option>
        <option>1000 Hz</option>
        <option>Real-time</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">

const { field } = useFieldGraph();
const { sim, isRunning, load } = useCircuitSimulator();

const onFrame = () => {
  if (!sim.value) return;
  sim.value.step();
  if (sim.value.getCurrentFrame() < sim.value.getSequenceLength()) {
    requestAnimationFrame(onFrame);
  } else {
    isRunning.value = false;
  }
}

const onStart = () => {
  if (isRunning.value) return;
  if (!field.value) return;
  load(field.value)
  requestAnimationFrame(onFrame);
  isRunning.value = true;
}

</script>
