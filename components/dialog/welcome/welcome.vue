<template>
  <Dialog
    ref="dialog"
    title="Welcome to Open-Konstruktor!"
    title-class="font-ttw text-xl text-center"
    no-actions
  >
    <div class="max-w-[500px] flex flex-col gap-4 mb-4">
      <div class="mb-4">
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
      <button
        class="h-12 mx-12 text-base font-medium"
        @click.stop="onClickClose"
      >
        Close
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { WelcomeDialogActionEvent } from '@/components/dialog/welcome/welcome-events';
import { useMenuBarListener } from '@/components/menu/bar-app-events';

const dialog = useTemplateRef('dialog');

function onClickStartTutorial() {
  dialog.value?.hide();
  document.dispatchEvent(new WelcomeDialogActionEvent('start-tutorial'));
}

function onClickPlayLevels() {
  dialog.value?.hide();
  document.dispatchEvent(new WelcomeDialogActionEvent('play-levels'));
}

function onClickClose() {
  dialog.value?.hide();
  document.dispatchEvent(new WelcomeDialogActionEvent('close'));
}

useMenuBarListener((event) => {
  if (event.id === 'file/welcome') {
    dialog.value?.show();
  }
});
</script>
