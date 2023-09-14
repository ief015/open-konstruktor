<template>
  <div
    class="flex items-center gap-2"
    :class="{ 'flex-row': props.horizontal, 'flex-col': !props.horizontal }"
  >
    <div v-for="item in toolkit" class="w-full">
      <div v-if="item === true" class="my-1" style="border-top: 1px solid #666"></div>
      <button
        v-else
        @click="onClickTool(item)"
        class="relative flex items-center justify-center w-full h-[3em] rounded border-solid border-2"
        :class="{
          [item.classes ?? '']: true,
          'border-white': item.mode === mode,
          'border-neutral-600': item.mode !== mode,
          'hover:border-neutral-300': item.mode !== mode,
        }"
      >
        <img v-if="item.icon" :src="item.icon" class="w-[12px] h-[12px]" />
        <span>{{ item.name }}</span>
        <span
          class="absolute top-0 right-0.5 text-black text-opacity-50 font-georgia10 text-[10px]"
        >
          {{ item.key }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ToolboxMode } from "@/composables/use-toolbox";

interface ToolkitItem {
  name: string;
  icon?: string;
  mode: ToolboxMode;
  classes?: string;
  labelClass?: string;
  key?: string;
}

const props = withDefaults(
  defineProps<{
    horizontal?: boolean;
  }>(),
  {
    horizontal: false,
  }
);

const emit = defineEmits<{
  change: [mode: ToolboxMode, prevMode: ToolboxMode];
}>();

const toolkit: (ToolkitItem|true)[] = [
  {
    name: "Select",
    mode: "select",
    key: "1",
  },
  true,
  {
    name: "Metal",
    mode: "draw-metal",
    classes: "bg-metal text-black font-bold",
    key: "2",
  },
  {
    name: "P-Type",
    mode: "draw-p-silicon",
    classes: "bg-ptype text-black font-bold",
    key: "3",
  },
  {
    name: "N-Type",
    mode: "draw-n-silicon",
    classes: "bg-ntype text-black font-bold",
    key: "4",
  },
  {
    name: "Via",
    mode: "draw-via",
    icon: "/tiles/link.png",
    classes: "bg-neutral-400 text-black font-bold",
    key: "5",
  },
  true,
  {
    name: "Erase",
    mode: "erase",
    key: "6",
  },
  {
    name: "Erase (Metal)",
    mode: "erase-metal",
    key: "7",
  },
  {
    name: "Erase (Silicon)",
    mode: "erase-silicon",
    key: "8",
  },
  {
    name: "Erase (Vias)",
    mode: "erase-via",
    key: "9",
  },
  {
    name: "Erase (Gates)",
    mode: "erase-gate",
    key: "0",
  },
];

const { mode, ignoreKeyShortcuts } = useToolbox();

const onChange = (mode: ToolboxMode, prevMode: ToolboxMode) => {
  emit("change", mode, prevMode);
};

const onClickTool = (item: ToolkitItem) => {
  let toMode = item.mode;
  if (toMode === mode.value) {
    toMode = "none";
  }
  const prevMode = mode.value;
  mode.value = toMode;
  onChange(toMode, prevMode);
};

useEventListener("keypress", (ev) => {
  if (ignoreKeyShortcuts.value) {
    return;
  }
  if (ev.key >= "0" && ev.key <= "9") {
    const item = toolkit.find((item) => {
      return item !== true && item.key === ev.key;
    }) as ToolkitItem | undefined;
    if (item) {
      onClickTool(item);
    }
  }
});
</script>

<style scoped>
button {
  padding: 0;
  cursor: pointer;
}
</style>
