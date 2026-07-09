<template>
  <svg viewBox="0 0 1 1" class="w-[0.5em] h-[0.5em]" :class="colourClass">
    <circle cx="0.5" cy="0.5" r="0.5" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  isRunning?: boolean;
  isPaused?: boolean;
}>();

const colourClass = computed(() => {
  if (props.isRunning === undefined && props.isPaused === undefined) {
    return 'grey-light';
  } else if (props.isRunning && !props.isPaused) {
    return 'green-light';
  } else if (props.isRunning && props.isPaused) {
    return 'yellow-light';
  } else if (!props.isRunning) {
    return 'red-light';
  }
});
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
.grey-light {
  color: #333333;
  filter: drop-shadow(0 0 0.5px #000);
}
</style>
