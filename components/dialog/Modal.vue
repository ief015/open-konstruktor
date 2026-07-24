<template>
  <div
    class="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm"
    style="backdrop-filter: blur(4px)"
  >
    <div
      class="fixed inset-0 flex items-center justify-center"
      @click="emit('click-outside')"
    >
      <div
        class="bg-neutral-600 p-4 rounded max-w-[80vw] max-h-[80vh] overflow-auto"
        @click.stop
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'click-outside': [];
}>();
</script>
