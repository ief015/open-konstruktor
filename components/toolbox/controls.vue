<template>
  <div
    class="flex items-center gap-2 p-2"
    :class="{ 'flex-row': props.horizontal, 'flex-col': !props.horizontal }"
  >
    <div v-for="(item, idx) in toolkit" class="w-full">
      <button
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
          {{ idx == 9 ? 0 : idx + 1 }}
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

const toolkit: ToolkitItem[] = [
  {
    name: "Select",
    mode: "select",
  },
  {
    name: "Metal",
    mode: "draw-metal",
    classes: "bg-metal text-black font-bold",
  },
  {
    name: "P-Type",
    mode: "draw-p-silicon",
    classes: "bg-ptype text-black font-bold",
  },
  {
    name: "N-Type",
    mode: "draw-n-silicon",
    classes: "bg-ntype text-black font-bold",
  },
  {
    name: "Via",
    mode: "draw-via",
    icon: "/tiles/link.png",
    classes: "bg-neutral-400 text-black font-bold",
  },
  {
    name: "Erase",
    mode: "erase",
  },
  {
    name: "Erase (Metal)",
    mode: "erase-metal",
  },
  {
    name: "Erase (Silicon)",
    mode: "erase-silicon",
  },
  {
    name: "Erase (Vias)",
    mode: "erase-via",
  },
  {
    name: "Erase (Gates)",
    mode: "erase-gate",
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
    const num = parseInt(ev.key);
    const index = num === 0 ? 9 : num - 1;
    const item = toolkit[index];
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
