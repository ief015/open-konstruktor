<template>
  <NuxtLayout>
    <template #top>
      <div class="h-[1.5em] bottom-border flex flex-row">
        <div class="font-ttw select-none mx-1">
          open-konstruktor
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
    <div class="flex flex-col w-full h-full">
      <div class="h-[66%]">
        <CircuitField class="w-full h-full" />
      </div>
      <div class="flex-1 top-border">
        <CircuitScope class="w-full h-full" />
      </div>
      <div class="h-[2em] top-border">
        <CircuitControls class="w-full h-full" />
      </div>
    </div>
  </NuxtLayout>
</template>

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
