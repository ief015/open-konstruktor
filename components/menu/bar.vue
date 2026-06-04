<template>
  <template v-if="true">
    <DockMenu
      v-bind="$attrs"
      class="undock font-ttw"
      :items="items"
      :theme="{
        primary: '#242424',
        secondary: '#333',
        tertiary: '#444',
      }"
      :on-selected="onSelected"
    />
    <DialogModal v-if="showImportDialog">
      <div class="flex flex-col gap-2">
        <textarea
          ref="importTextArea"
          class="max-w-sm w-[50vw] h-32 font-mono break-words"
          v-model="importCode"
          @keypress.enter="onImport"
        />
        <div class="flex flex-row gap-2 justify-end">
          <button
            @click="onImport"
            :disabled="!importCode.length"
            class="font-bold"
          >
            Import
          </button>
          <button @click="showImportDialog = false">Cancel</button>
        </div>
      </div>
    </DialogModal>
    <DialogModal v-if="showExportDialog">
      <div class="flex flex-col gap-2">
        <textarea
          readonly
          ref="exportTextArea"
          class="max-w-sm w-[50vw] h-32 font-mono break-words"
          :value="exportCode"
        />
        <div class="flex flex-row gap-2 justify-end">
          <button @click="onCopyExport" class="font-bold">
            {{ exportCopied ? 'Copied!' : 'Copy' }}
          </button>
          <button @click="showExportDialog = false">Close</button>
        </div>
      </div>
    </DialogModal>
    <input
      type="file"
      ref="fileInputLoad"
      class="hidden"
      @change="onFileSelectedLoad"
    />
  </template>
</template>

<script setup lang="ts">
// @ts-ignore
import { DockMenu } from '@/external/vue-dock-menu/vue-dock-menu.es';
import '@/external/vue-dock-menu/assets/output-9689c4bb.css';
import type { CircuitDesignData } from '@/serialization';
import { useMenuItems } from '@/components/menu/items';

const { field, load, loadBlank } = useFieldGraph();
const { load: loadSim, circuitFactory } = useCircuitSimulator();
const { getLoader } = useCircuitLoaders();
const { ignoreKeyShortcuts } = useToolbox();
const showImportDialog = ref(false);
const showExportDialog = ref(false);
const importTextArea = ref<HTMLTextAreaElement>();
const exportTextArea = ref<HTMLTextAreaElement>();
const fileInputLoad = ref<HTMLInputElement>();
const exportCode = ref('');
const exportCopied = ref(false);
const importCode = ref('');
const { items } = useMenuItems();

const onClear = () => {
  const data = field.value.getData() as CircuitDesignData;
  const { columns, rows } = data.getDimensions();
  const pinRows = data.getPinRowsCount();
  loadBlank(columns, rows, pinRows);
  loadSim(field.value);
};

const loadLevel = (levelName: string) => {
  const loader = getLoader(levelName);
  if (!loader) {
    throw new Error(`Unknown loader: ${levelName}`);
  }
  loadBlank(loader.width, loader.height, loader.pinRows);
  loadSim(field.value, loader);
};

const onShowImportDialog = () => {
  importCode.value = '';
  showImportDialog.value = true;
  nextTick(() => {
    importTextArea.value?.focus();
  });
};

const onShowExportDialog = () => {
  exportCode.value = field.value.toSaveString() ?? '';
  showExportDialog.value = true;
  exportCopied.value = false;
  nextTick(() => {
    exportTextArea.value?.focus();
    exportTextArea.value?.select();
  });
};

const onFileSelectedLoad = () => {
  if (!fileInputLoad.value?.files?.[0]) return;
  const file = fileInputLoad.value.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result;
    if (typeof text === 'string') {
      try {
        const { data, levelKey, version } = JSON.parse(text);
        if (version !== 0) {
          throw new Error(`Unsupported design file version '${version}'`);
        }
        if (!data) {
          throw new Error(
            "Invalid design file format: missing 'data' property",
          );
        }
        if (levelKey && circuitFactory.value?.key !== levelKey) {
          loadLevel(levelKey);
        }
        load(data);
        loadSim(field.value);
      } catch (e: any) {
        alert(`Failed to load:\n${e.message ?? e}`);
      }
    }
  };
  reader.readAsText(file);
};

const onSaveDesign = () => {
  const levelKey = circuitFactory.value?.key || null;
  const data = {
    version: 0,
    levelKey: levelKey,
    data: field.value.toSaveString(),
  };
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  const date = new Date().toISOString().replace(/[^a-z0-9]/gi, '');
  downloadAnchorNode.setAttribute(
    'download',
    `${levelKey ?? 'design'}-${date}.json`,
  );
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const onLoadDesign = () => {
  fileInputLoad.value?.click();
};

const closeAllDialogs = () => {
  showImportDialog.value = false;
  showExportDialog.value = false;
};

const onCopyExport = () => {
  navigator.clipboard.writeText(exportCode.value);
  exportCopied.value = true;
};

const onImport = () => {
  if (!importCode.value) return;
  try {
    load(importCode.value);
    loadSim(field.value);
    showImportDialog.value = false;
  } catch (e: any) {
    alert(`Failed to import:\n${e.message ?? e}`);
  }
};

const onSelected = ({
  name,
  path,
  id,
}: {
  name: string;
  path: string;
  id: string;
}) => {
  switch (id) {
    case 'file/load-design':
      onLoadDesign();
      return;
    case 'file/save-design':
      onSaveDesign();
      return;
    case 'file/import':
      onShowImportDialog();
      return;
    case 'file/export':
      onShowExportDialog();
      return;
    case 'file/clear':
      onClear();
      return;
    case 'view/reset':
      document.dispatchEvent(new Event('game/reset-view'));
      return;
  }
  if (id.startsWith('level/')) {
    const loaderKey = id.slice('level/'.length);
    loadLevel(loaderKey);
  }
};

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDialogs();
  }
});

watch(importCode, (code) => {
  // remove newlines
  importCode.value = code.replace(/\r?\n|\r/g, '');
});

watch([showExportDialog, showImportDialog], (values) => {
  // ignore toolbox keyboard shortcuts while dialogs are open
  ignoreKeyShortcuts.value = values.some((v) => v);
});
</script>

<style scoped>
.undock {
  position: static !important;
  height: 100% !important;
}
</style>
