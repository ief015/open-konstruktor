<template>
  <div class="flex flex-col items-center gap-4 mb-4">
    <div class="font-ttw text-xl text-center">Welcome to Open-Konstruktor!</div>
    <div class="text-center">
      Open-Konstruktor is a game about designing and simulating digital
      circuits, based on the Zachtronics game
      <a
        class="text-gray-200 underline"
        href="https://www.zachtronics.com/kohctpyktop-engineer-of-the-people"
        target="_blank"
      >
        KOHCTPYKTOP: Engineer of the People.
      </a>
    </div>
    <button
      class="h-12 mx-12 text-base font-medium"
      @click.stop="onClickStartTutorial"
    >
      Start Tutorial
    </button>
    <button
      class="h-12 mx-12 text-base font-medium"
      @click.stop="onClickPlayLevels"
    >
      Play Levels
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMenuBarListener } from '@/components/menu/bar-app-events';
import { WelcomeActionEvent } from '@/components/welcome/welcome-events';

const dialog = useTemplateRef('dialog');

function onClickStartTutorial() {
  dialog.value?.hide();
  document.dispatchEvent(new WelcomeActionEvent('start-tutorial'));
}

function onClickPlayLevels() {
  dialog.value?.hide();
  document.dispatchEvent(new WelcomeActionEvent('play-levels'));
}

useMenuBarListener((event) => {
  if (event.id === 'file/welcome') {
    dialog.value?.show();
  }
});
</script>
