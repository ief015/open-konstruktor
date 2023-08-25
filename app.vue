<template>
  <NuxtLayout>
    <template #top>
      <div class="h-[1.5em] bottom-border flex flex-row">
        <div class="font-ttw select-none ml-2 mr-3 self-center">
          open-konstruktor
        </div>
        <div class="flex-1">
          <MenuBar />
        </div>
      </div>
    </template>
    <template #bottom>
      <div class="h-[1.5em] top-border"></div>
    </template>
    <template #left>
      <div class="w-[15em] h-full right-border"></div>
    </template>
    <template #right>
      <div class="w-[5em] h-full left-border">
        <ToolboxControls />
      </div>
    </template>
    <div class="flex flex-col h-full">
      <div class="flex-1" ref="circuitFieldContainer">
        <CircuitField
          v-if="circuitFieldContainer"
          :style="{
            width: Math.floor(circuitFieldContainer.clientWidth ?? 400) + 'px',
            height: Math.floor(circuitFieldContainer.clientHeight ?? 300) + 'px',
          }"
          :width="Math.floor(circuitFieldContainer.clientWidth ?? 400)"
          :height="Math.floor(circuitFieldContainer.clientHeight ?? 300)"
        />
      </div>
      <div class="top-border">
        <CircuitScope />
      </div>
      <div class="top-border py-2">
        <CircuitControls class="w-full h-full" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">

const circuitFieldContainer = ref<HTMLDivElement>();

</script>

<style scoped>
.bottom-border {
  border-bottom: 1px solid black;
}
.top-border {
  border-top: 1px solid black;
}
.left-border {
  border-left: 1px solid black;
}
.right-border {
  border-right: 1px solid black;
}
</style>
