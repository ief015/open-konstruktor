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
import { MenuBarActionEvent } from '@/components/menu/bar-app-events';
import { useWelcomeActionListener } from '@/components/welcome/welcome-events';
import type { CircuitDesignData } from '@/serialization';

const { items: menuItems } = useMenuItems();
const circuitSimulation = injectCircuitSimulationOptional();
const { ignoreKeyShortcuts } = useToolbox();
const designs = useSavedDesigns();
const snippets = useSavedSnippets();
const clipboard = inject<ReturnType<typeof useClipboard>>('clipboard');

const menuBar = useTemplateRef('menuBar');
const importTextArea = useTemplateRef('importTextArea');
const exportTextArea = useTemplateRef('exportTextArea');
const fileInputImportDesigns = useTemplateRef('fileInputImportDesigns');
const fileInputImportSnippets = useTemplateRef('fileInputImportSnippets');

const showImportDialog = ref(false);
const showExportDialog = ref(false);
const exportCode = ref('');
const exportIsKOHCTPYKTOPCompatible = ref(false);
const exportCopied = ref(false);
const importCode = ref('');

function onShowImportDialog() {
  importCode.value = '';
  showImportDialog.value = true;
  nextTick(() => {
    importTextArea.value?.focus();
  });
}

function onShowExportDialog() {
  const sim = circuitSimulation.value;
  if (!sim) return;
  const field = sim.field.field.value;
  if (!field) return;
  exportCode.value = field.toSaveString() ?? '';
  exportIsKOHCTPYKTOPCompatible.value = !!(
    field.getData() as CircuitDesignData
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
    const sim = circuitSimulation.value;
    if (!sim) return;
    sim.field.load(importCode.value);
    sim.load();
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
}

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDialogs();
  }
});

useWelcomeActionListener((event) => {
  switch (event.action) {
    case 'play-levels':
      menuBar.value?.openMenu('levels');
      break;
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
