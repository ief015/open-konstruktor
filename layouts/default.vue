<template>
  <div class="flex flex-col w-screen h-screen">
    <div>
      <slot name="top" />
    </div>
    <div class="flex-1 flex flex-row justify-between">
      <div>
        <slot name="left" />
      </div>
      <div class="flex-1 relative">
        <slot />
      </div>
      <div>
        <slot name="right" />
      </div>
    </div>
    <div>
      <slot name="bottom" />
    </div>
  </div>
</template>
