export type DialogInfo<TData = any> = {
  /**
   * Unique dialog identifier.
   */
  id: UUID;
  /**
   * Dialog title.
   */
  title: string;
  /**
   * Dialog body. Can be a string or a Vue component.
   */
  body: string | Component;
  persistent: boolean;
  ok: boolean | string;
  cancel: boolean | string;
  onOk?: (data?: TData) => void;
  onCancel?: () => void;
  onHide?: () => void;
};

export type DialogInfoInit = Omit<DialogInfo, 'id'>;

const dialogs = ref<DialogInfo[]>([]);
const anyOpen = computed(() => dialogs.value.length > 0);

const InitDefaults: DialogInfoInit = {
  title: '',
  body: '',
  persistent: false,
  ok: true,
  cancel: true,
};

function toDialogId(dialog: DialogInfo | DialogInfo['id']): DialogInfo['id'] {
  if (typeof dialog === 'string') {
    return dialog;
  }
  return dialog.id;
}

function toDialog(
  dialog: DialogInfo | DialogInfo['id'],
): DialogInfo | undefined {
  if (typeof dialog === 'string') {
    return dialogs.value.find((d) => d.id === dialog);
  }
  return dialog;
}

function findIndex(dialog: DialogInfo | DialogInfo['id']): number {
  dialog = toDialogId(dialog);
  return dialogs.value.findIndex((d) => d.id === dialog);
}

function emitHide(dialog: DialogInfo | DialogInfo['id']) {
  const d = toDialog(dialog);
  d?.onHide?.();
}

export function useDialog() {
  function create(init: Partial<DialogInfoInit>): DialogInfo {
    const id = generateUUID();
    const info: DialogInfo = {
      id,
      ...InitDefaults,
      ...init,
    };
    dialogs.value.push(info);
    return info;
  }

  function close(dialog: DialogInfo | DialogInfo['id']) {
    const d = toDialog(dialog);
    const idx = findIndex(dialog);
    if (idx !== -1) {
      dialogs.value.splice(idx, 1);
    }
    if (d) {
      emitHide(d);
    }
  }

  function closeAll() {
    // close in LIFO order in case of dependency between dialogs
    while (dialogs.value.length > 0) {
      const dialog = dialogs.value.pop();
      if (dialog) {
        emitHide(dialog);
      }
    }
  }

  return {
    create,
    close,
    closeAll,
    dialogs,
    anyOpen,
  };
}
