<template>
  <div v-if="isOpen" class="bg-neutral-900 bg-opacity-95 rounded shadow-lg">
    <div class="relative p-4 flex flex-col gap-4">
      <div class="flex flex-row justify-between">
        <div class="font-ttw text-lg text-ellipsis">
          {{ title }}
        </div>
        <div class="cursor-pointer px-2" @click="close()">
          🗙
        </div>
      </div>
      <div class="font-mono text-sm h-[16em] overflow-auto">
        <div v-html="contentHtml" />
      </div>
      <div class="flex flex-row justify-center gap-4">
        <button
          class="min-w-[4em]"
          @click="previous()"
          :disabled="page <= 0"
        >
          &lt;
        </button>
        <div class="font-ttw text-center min-w-[5em] select-none">
          {{ page + 1 }} / {{ lengthAvailablePages }}
        </div>
        <button
          class="min-w-[4em]"
          @click="next()"
          :disabled="page >= lengthAvailablePages - 1"
        >
          &gt;
        </button>
      </div>
      <div class="absolute bottom-0 right-0 m-4">
        <button
          v-if="nextLevelId"
          class="float-right"
          @click="loadLevel(nextLevelId)"
          :title="`Next Level: ${nextLevelId}`"
        >
          Start Next Level
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="lengthAvailablePages > 0" class="text-center">
    <button @click="open()">
      Show Info
    </button>
  </div>
</template>

<script setup lang="ts">
const {
  isOpen,
  page,
  lengthAvailablePages,
  title,
  contentHtml,
  nextLevelId,
  next,
  previous,
  open,
  close,
} = useLevelInfo();
const { field, load, loadBlank } = useFieldGraph();
const { load: loadSim } = useCircuitSimulator();
const { getLoader } = useCircuitLoaders();

const loadLevel = (id: string) => {
  const loader = getLoader(id);
  if (!loader) {
    throw new Error(`Could not find level with id ${id}`);
  }
  loadBlank(loader.width, loader.height, loader.pinRows);
  loadSim(field.value, loader);
}

</script>
