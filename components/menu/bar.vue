<template>
  <DockMenu
    class="undock font-ttw"
    :items="items"
    :theme="{
      primary: '#00000000',
      secondary: '#333',
      tertiary: '#444',
      textColor: 'inherit',
    }"
    :on-selected="onSelected"
  />
</template>

<script setup lang="ts">
// @ts-ignore
import { DockMenu } from "@/external/vue-dock-menu/vue-dock-menu.es";
import "@/external/vue-dock-menu/assets/output-9689c4bb.css";

const items = [
  {
    id: 'file',
    name: "File",
    menu: [
      { id: 'open', name: "Open" },
      { id: 'new-window', name: "New Window" },
      { id: 'exit', name: "Exit" }
    ]
  },
  {
    id: 'edit',
    name: "Edit",
    menu: [
      { id: 'cut', name: "Cut" },
      { id: 'cope', name: "Copy" },
      { id: 'paste', name: "Paste" }
    ]
  },
];

type OnSelectedParams = { name: string; path: string };

const onSelected = (item: OnSelectedParams) => {
  console.log('menubar:onSelected', item);
}

</script>

<style scoped>

.undock {
  position: static !important;
  height: 100% !important;
}

</style>