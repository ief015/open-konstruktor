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
  />
</template>

<script setup lang="ts">
import { DockMenu } from "vue-dock-menu";
import "vue-dock-menu/dist/vue-dock-menu.css";

const items = [
  {
    name: "File",
    menu: [{ name: "Open"}, {name: "New Window"}, {name: "Exit"}]
  },
  {
    name: "Edit",
    menu: [{ name: "Cut"}, {name: "Copy"}, {name: "Paste"}]
  },
];

</script>

<style scoped>

.undock {
  position: static !important;
  height: 100% !important;
}

</style>