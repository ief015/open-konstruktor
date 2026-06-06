<template>
  <DialogModal :class="isOpen ? 'block' : 'hidden'">
    <div class="flex flex-col gap-4">
      <slot name="title">
        <span
          v-if="title"
          class="text-base font-bold"
          :class="titleClass"
          :style="titleStyle"
        >
          {{ title }}
        </span>
      </slot>
      <slot />
      <div v-if="!noActions" class="flex flex-row justify-end gap-2">
        <slot name="actions">
          <slot name="prepend-actions" />
          <button v-if="!!btnOk" :disabled="disableOk" @click="onOk">
            {{ btnOkLabel }}
          </button>
          <button
            v-if="!!btnCancel"
            :disabled="disableCancel"
            @click="onCancel"
          >
            {{ btnCancelLabel }}
          </button>
          <slot name="append-actions" />
        </slot>
      </div>
    </div>
  </DialogModal>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    startOpen?: boolean;
    title?: string;
    titleClass?: string;
    titleStyle?: string;
    btnOk?: boolean | string;
    btnCancel?: boolean | string;
    disableOk?: boolean;
    disableCancel?: boolean;
    noActions?: boolean;
  }>(),
  {
    btnOk: true,
    btnCancel: true,
  },
);

const toolbox = useToolbox();

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
};

const hide = () => {
  isOpen.value = false;
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const onOk = () => {
  emit('ok');
  hide();
};

const onCancel = () => {
  emit('cancel');
  hide();
};

watch(isOpen, (opened) => {
  if (opened) {
    toolbox.ignoreKeyShortcuts.value = true;
    emit('show');
  } else {
    // FIXME: nested dialogs will cause this to re-enable shortcuts too early
    toolbox.ignoreKeyShortcuts.value = false;
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
