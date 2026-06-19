<template>
  <div>
    <MenuBar
      ref="menuBar"
      class="font-ttw"
      :items="menuItems"
      horizontal
      no-hover-open
      @selected="onSelected"
    />
    <DialogModal v-if="showImportDialog">
      <div class="flex flex-col gap-2">
        <textarea
          ref="importTextArea"
          class="max-w-sm w-[50vw] h-32 break-words text-sm"
          v-model="importCode"
          @keypress.enter="onImport"
        />
        <div class="flex flex-row gap-2 justify-end">
          <button
            @click="onImport"
            :disabled="!importCode.length"
            class="font-medium"
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
          class="max-w-sm w-[50vw] h-32 break-words text-sm"
          :value="exportCode"
        />
        <div class="flex flex-row justify-end items-center gap-2">
          <div
            v-if="!exportIsKOHCTPYKTOPCompatible"
            class="text-xs text-neutral-400 text-right"
          >
            KOHCTPYKTOP Incompatible
          </div>
          <button @click="onCopyExport" class="font-medium">
            {{ exportCopied ? 'Copied!' : 'Copy' }}
          </button>
          <button @click="showExportDialog = false">Close</button>
        </div>
      </div>
    </DialogModal>
    <input
      type="file"
      ref="fileInputImportDesigns"
      class="hidden"
      @change="onFileSelectedDesigns"
    />
    <input
      type="file"
      ref="fileInputImportSnippets"
      class="hidden"
      @change="onFileSelectedSnippets"
    />
  </div>
</template>

<script setup lang="ts">
import { useMenuItems } from '@/composables/menu-items';
import { MenuBarActionEvent } from '@/components/menu/bar-app-events';
import { WelcomeDialogActionEvent } from '@/components/dialog/welcome/welcome-events';
import type { SavedDesignsExport } from '@/composables/use-saved-designs';
import type { CircuitDesignData } from '@/serialization';

const { items: menuItems } = useMenuItems();
const { field, load: loadDesign, loadBlank: loadBlankDesign } = useFieldGraph();
const { load: loadSim, circuitFactory } = useCircuitSimulator();
const { getLoader } = useCircuitLoaders();
const { ignoreKeyShortcuts } = useToolbox();
const designs = useSavedDesigns();
const snippets = useSavedSnippets();
const clipboard = inject<ReturnType<typeof useClipboard>>('clipboard');
const showImportDialog = ref(false);
const showExportDialog = ref(false);
const importTextArea = useTemplateRef('importTextArea');
const exportTextArea = useTemplateRef('exportTextArea');
const fileInputImportDesigns = useTemplateRef('fileInputImportDesigns');
const fileInputImportSnippets = useTemplateRef('fileInputImportSnippets');
const exportCode = ref('');
const exportIsKOHCTPYKTOPCompatible = ref(false);
const exportCopied = ref(false);
const importCode = ref('');
const menuBar = useTemplateRef('menuBar');

function loadLevel(levelName: string) {
  const loader = getLoader(levelName);
  if (!loader) {
    throw new Error(`Unknown loader: ${levelName}`);
  }
  loadBlankDesign(loader.width, loader.height, loader.pinRows);
  loadSim(field.value, loader);
}

function onShowImportDialog() {
  importCode.value = '';
  showImportDialog.value = true;
  nextTick(() => {
    importTextArea.value?.focus();
  });
}

function onShowExportDialog() {
  exportCode.value = field.value.toSaveString() ?? '';
  exportIsKOHCTPYKTOPCompatible.value = !!(
    field.value.getData() as CircuitDesignData
  ).isKOHCTPYKTOPCompatible?.();
  showExportDialog.value = true;
  exportCopied.value = false;
  nextTick(() => {
    exportTextArea.value?.focus();
    exportTextArea.value?.select();
  });
}

function closeAllDialogs() {
  showImportDialog.value = false;
  showExportDialog.value = false;
}

function onCopyExport() {
  if (!clipboard) return;
  clipboard.copy(exportCode.value);
  exportCopied.value = true;
}

function onImport() {
  if (!importCode.value) return;
  try {
    loadDesign(importCode.value);
    loadSim(field.value);
    showImportDialog.value = false;
  } catch (e: any) {
    alert(`Failed to import:\n${e.message ?? e}`);
  }
}

async function onFileSelectedDesigns(ev: Event) {
  const input = ev.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  const file = input.files[0];
  const data = await readFileJSON<SavedDesignsExport>(file);
  const imported = await designs.importDesigns(data).catch((e) => {
    alert(`Failed to import designs:\n${e.message ?? e}`);
    throw e;
  });
  if (imported.some((result) => result.status === 'rejected')) {
    alert(
      'Some designs failed to import. Please check the console for details.',
    );
    console.error('Import designs results:', imported);
  } else {
    alert('Designs imported successfully!');
  }
  fileInputImportDesigns.value!.value = '';
}

async function onFileSelectedSnippets(ev: Event) {
  const input = ev.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  const file = input.files[0];
  const data = await readFileJSON<SavedSnippetsExport>(file);
  const imported = await snippets.importSnippets(data).catch((e) => {
    alert(`Failed to import snippets:\n${e.message ?? e}`);
    throw e;
  });
  if (imported.some((result) => result.status === 'rejected')) {
    alert(
      'Some snippets failed to import. Please check the console for details.',
    );
    console.error('Import snippets results:', imported);
  } else {
    alert('Snippets imported successfully!');
  }
  fileInputImportSnippets.value!.value = '';
}

async function onSelected(id?: string) {
  if (!id) return;
  document.dispatchEvent(new MenuBarActionEvent(id));
  switch (id) {
    case 'file/import':
      onShowImportDialog();
      return;
    case 'file/export':
      onShowExportDialog();
      return;
    case 'file/import-designs':
      fileInputImportDesigns.value?.click();
      return;
    case 'file/export-designs': {
      const date = new Date().toISOString().replace(/[^a-z0-9]/gi, '');
      await designs.exportDesigns({
        download: true,
        downloadFilename: `exported-designs-${date}.json`,
      });
      return;
    }
    case 'file/import-snippets':
      fileInputImportSnippets.value?.click();
      return;
    case 'file/export-snippets': {
      const date = new Date().toISOString().replace(/[^a-z0-9]/gi, '');
      await snippets.exportSnippets({
        download: true,
        downloadFilename: `exported-snippets-${date}.json`,
      });
      return;
    }
  }
  if (id.startsWith('level/')) {
    const loaderKey = id.slice('level/'.length);
    loadLevel(loaderKey);
  }
}

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDialogs();
  }
});

useEventListener(
  document,
  WelcomeDialogActionEvent.eventType,
  (event: WelcomeDialogActionEvent) => {
    switch (event.action) {
      case 'start-tutorial':
        loadLevel('Tutorial 01 Introduction');
        break;
      case 'play-levels':
        menuBar.value?.openMenu('levels');
        break;
    }
  },
);

watch(importCode, (code) => {
  // remove newlines
  importCode.value = code.replace(/\r?\n|\r/g, '');
});

watch([showExportDialog, showImportDialog], (values) => {
  // ignore toolbox keyboard shortcuts while dialogs are open
  ignoreKeyShortcuts.value = values.some((v) => v);
});
</script>
