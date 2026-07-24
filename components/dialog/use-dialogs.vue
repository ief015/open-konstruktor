<template>
  <Dialog
    v-for="dialog of dialogs"
    :key="dialog.id"
    :title="dialog.title"
    :btn-ok="dialog.ok"
    :btn-cancel="dialog.cancel"
    :persistent="dialog.persistent"
    @ok="onOk(dialog)"
    @cancel="onCancel(dialog)"
    @hide="onHide(dialog)"
    start-open
  >
    <div v-if="typeof dialog.body === 'string'">
      {{ dialog.body }}
    </div>
    <component v-else :is="dialog.body" />
  </Dialog>
</template>

<script setup lang="ts">
const { dialogs, close } = useDialog();

function onOk(dialog: DialogInfo) {
  dialog.onOk?.();
  close(dialog);
}

function onCancel(dialog: DialogInfo) {
  dialog.onCancel?.();
  close(dialog);
}

function onHide(dialog: DialogInfo) {
  close(dialog);
}
</script>
