<template>
  <NuxtLayout class="max-w-screen max-h-screen">
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
      <div class="w-[10em] h-full right-border flex flex-col">
        <div class="text-xs font-ttw text-center m-1 select-none">Designs</div>
        <ToolboxDesignSelect class="flex-1" />
        <div class="text-xs font-ttw text-center m-1 select-none">Snippets</div>
        <ToolboxSnippetsSelect class="flex-1" />
      </div>
    </template>
    <template #right>
      <div class="w-[5em] h-full left-border">
        <div class="text-xs font-ttw text-center m-1 select-none">Toolbox</div>
        <ToolboxControls class="m-2" />
      </div>
    </template>
    <div class="absolute inset-0">
      <div class="flex flex-col h-full">
        <div class="flex-1 overflow-hidden">
          <CircuitField />
        </div>
        <div class="top-border">
          <CircuitScope class="min-h-[10em]" />
        </div>
        <div class="top-border py-2">
          <CircuitControls class="w-full h-full" />
        </div>
      </div>
      <div class="absolute inset-x-0 top-0 flex flex-row justify-center">
        <DialogInfoBox class="m-2 w-[1000px]" />
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
