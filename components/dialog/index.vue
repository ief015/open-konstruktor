<template>
  <DialogModal v-if="isOpen">
    <div class="flex flex-col gap-4">
      <slot name="title">
        <span v-if="title" class="text-base font-bold">
          {{ title }}
        </span>
      </slot>
      <div class="text-xs">
        <slot/>
      </div>
      <div class="flex flex-row justify-end gap-2">
        <slot name="actions">
          <button v-if="!!btnOk" @click="onOk">{{ btnOkLabel }}</button>
          <button v-if="!!btnCancel" @click="onCancel">{{ btnCancelLabel }}</button>
        </slot>
      </div>
    </div>
  </DialogModal>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  startOpen?: boolean;
  title?: string;
  btnOk?: boolean|string;
  btnCancel?: boolean|string;
}>(), {
  btnOk: true,
  btnCancel: true,
});

const isOpen = defineModel<boolean>({
  default: false,
});

const emit = defineEmits<{
  show: [void];
  hide: [void];
  cancel: [void];
  ok: [void];
}>();

const btnOkLabel = computed(() => {
  if (typeof props.btnOk === 'string') {
    return props.btnOk;
  }
  return 'OK';
});

const btnCancelLabel = computed(() => {
  if (typeof props.btnCancel === 'string') {
    return props.btnCancel;
  }
  return 'Cancel';
});

const show = () => {
  isOpen.value = true;
}

const hide = () => {
  isOpen.value = false;
}

const toggle = () => {
  isOpen.value = !isOpen.value;
}

const onOk = () => {
  emit('ok');
  hide();
}

const onCancel = () => {
  emit('cancel');
  hide();
}

watch(isOpen, (opened) => {
  if (opened) {
    emit('show');
  } else {
    emit('hide');
  }
});

onMounted(() => {
  if (props.startOpen) {
    show();
  }
});

defineExpose({
  show,
  hide,
  toggle,
});

</script>