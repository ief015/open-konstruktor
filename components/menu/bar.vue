<template>
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
  >
  </DockMenu>
  <DialogModal v-if="showImportDialog">
    <div class="flex flex-col gap-2">
      <textarea
        ref="importTextArea"
        class="max-w-sm w-[50vw] h-32 font-mono break-words"
        v-model="importCode"
        @keypress.enter="onImport"
      />
      <div class="flex flex-row gap-2 justify-end">
        <button @click="onImport" class="font-bold">
          Import
        </button>
        <button @click="showImportDialog = false">
          Cancel
        </button>
      </div>
    </div>
  </DialogModal>
  <DialogModal v-if="showExportDialog">
    <div class="flex flex-col gap-2">
      <textarea readonly
        ref="exportTextArea"
        class="max-w-sm w-[50vw] h-32 font-mono break-words"
        :value="exportCode"
      />
      <div class="flex flex-row gap-2 justify-end">
        <button @click="onCopyExport" class="font-bold">
          {{ exportCopied ? 'Copied!' : 'Copy' }}
        </button>
        <button @click="showExportDialog = false">
          Close
        </button>
      </div>
    </div>
  </DialogModal>
</template>

<script setup lang="ts">
// @ts-ignore
import { DockMenu } from "@/external/vue-dock-menu/vue-dock-menu.es";
import "@/external/vue-dock-menu/assets/output-9689c4bb.css";
import { kohctpyktop } from "@/circuits/kohctpyktop";
import { openkonstruktor } from "@/circuits/open-konstruktor";
import { CircuitSimulationFactory } from "@/circuits";

const { field, load, loadBlank } = useFieldGraph();
const { load: loadSim, stop } = useCircuitSimulator();
const { ignoreKeyShortcuts } = useToolbox();
const showImportDialog = ref(false);
const showExportDialog = ref(false);
const importTextArea = ref<HTMLTextAreaElement>();
const exportTextArea = ref<HTMLTextAreaElement>();
const exportCode = ref('');
const exportCopied = ref(false);
const importCode = ref('');
const items = [
  {
    name: "File",
    menu: [
      { id: 'import', name: "Import" },
      { id: 'export', name: "Export" },
      { isDivider: true },
      { id: 'clear', name: "Clear" }
    ]
  },
  {
    name: "Levels",
    menu: [
      {
        name: "01 - 06",
        menu: [
          { id: 'level:01 KT411I QUAD INVERTER GATE',             name: "01 - KT411I - QUAD INVERTER GATE" },
          { id: 'level:02 KT221A DUAL 2-INPUT AND GATE',          name: "02 - KT221A - DUAL 2-INPUT AND GATE" },
          { id: 'level:03 KT141AO 4-INPUT AND-OR GATE',           name: "03 - KT141AO - 4-INPUT AND-OR GATE" },
          { id: 'level:04 KO229 POWER ON RESET GENERATOR',        name: "04 - KO229 - POWER ON RESET GENERATOR" },
          { id: 'level:05 KO223 DUAL FIXED FREQUENCY OSCILLATOR', name: "05 - KO223 - DUAL FIXED FREQUENCY OSCILLATOR" },
          { id: 'level:06 KL2S1 DUAL SET-RESET LATCH',            name: "06 - KL2S1 - DUAL SET-RESET LATCH" },
        ],
      },
      {
        name: "07 - 11",
        menu: [
          
          { id: 'level:07 KL2T1 DUAL TOGGLE LATCH',          name: "07 - KL2T1 - DUAL TOGGLE LATCH" },
          { id: 'level:08 KO224X DUAL FREQUENCY OSCILLATOR', name: "08 - KO224X - DUAL FREQUENCY OSCILLATOR" },
          { id: 'level:09 KD124 2-TO-4 LINE DECODER',        name: "09 - KD124 - 2-TO-4 LINE DECODER" },
          { id: 'level:10 KA180 2-BIT ADDER WITH CARRY',     name: "10 - KA180 - 2-BIT ADDER WITH CARRY" },
          { id: 'level:11 KC82F DIVIDE-BY-FOUR COUNTER',     name: "11 - KC82F - DIVIDE-BY-FOUR COUNTER" },
        ],
      },
      {
        name: "12 - 16",
        menu: [
          { id: 'level:12 KM141P 4-TO-1 MULTIPLEXER',         name: "12 - KM141P - 4-TO-1 MULTIPLEXER" },
          { id: 'level:13 KC84C 4-BIT COUNTER WITH CLEAR',    name: "13 - KC84C - 4-BIT COUNTER WITH CLEAR" },
          { id: 'level:14 KC74S 4-BIT SHIFT REGISTER S-TO-P', name: "14 - KC74S - 4-BIT SHIFT REGISTER S-TO-P" },
          { id: 'level:15 KR8S1 8-BIT ADDRESSABLE SRAM',      name: "15 - KR8S1 - 8-BIT ADDRESSABLE SRAM" },
          { id: 'level:16 KA181 2-BIT LOGICAL FUNCTION UNIT', name: "16 - KA181 - 2-BIT LOGICAL FUNCTION UNIT" },
        ],
      },
      {
        name: "17 - 19",
        menu: [
          { id: 'level:17 X901 RADIO MESSAGE STREAM DECODER',   name: "17 - X901 - RADIO MESSAGE STREAM DECODER" },
          { id: 'level:18 X902 GRENADE LAUNCHER AMMO COUNTER',  name: "18 - X902 - GRENADE LAUNCHER AMMO COUNTER" },
          { id: 'level:19 X903 GATLING CANNON FIRE CONTROLLER', name: "19 - X903 - GATLING CANNON FIRE CONTROLLER" },
        ],
      },
      {
        name: "Open-Konstruktor",
        menu: [
          { id: 'level:OC2C1 DUAL FULL COMPARATOR',   name: "OC2C1 DUAL FULL COMPARATOR" },
          { id: 'level:Very large test',   name: "Very large test" },
        ],
      },
    ]
  },
];
const loaders: Record<string, CircuitSimulationFactory> = {
  ...kohctpyktop,
  ...openkonstruktor,
};

const onClear = () => {
  loadBlank(); // FIXME: this will load default canvas size
  loadSim(field.value);
}

const onLoadCircuit = (loader: CircuitSimulationFactory) => {
  loadBlank(loader.width, loader.height, loader.pinRows);
  loadSim(field.value, loader);
}

const onShowImportDialog = () => {
  importCode.value = '';
  showImportDialog.value = true;
  nextTick(() => {
    importTextArea.value?.focus();
  });
}

const onShowExportDialog = () => {
  exportCode.value = field.value.toSaveString() ?? '';
  showExportDialog.value = true;
  exportCopied.value = false;
  nextTick(() => {
    exportTextArea.value?.focus();
    exportTextArea.value?.select();
  });
}

const closeAllDialogs = () => {
  showImportDialog.value = false;
  showExportDialog.value = false;
}

const onCopyExport = () => {
  navigator.clipboard.writeText(exportCode.value);
  exportCopied.value = true;
}

const onImport = () => {
  if (!importCode.value) return;
  load(importCode.value);
  loadSim(field.value);
  showImportDialog.value = false;
}

const onSelected = ({ name, path, id }: { name: string; path: string, id: string }) => {
  if (id === 'import') {
    onShowImportDialog();
  } else if (id === 'export') {
    onShowExportDialog();
  } else if (id === 'clear') {
    onClear();
  } else if (id.startsWith('level:')) {
    const loaderKey = id.split(':')[1];
    const loader = loaders[loaderKey];
    if (!loader) {
      throw new Error(`Unknown loader: ${loaderKey}`);
    }
    onLoadCircuit(loaders[loaderKey]);
  }
}

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllDialogs();
  }
});

watch(importCode, (code) => {
  // remove newlines
  importCode.value = code.replace(/\r?\n|\r/g, '');
});

watch([ showExportDialog, showImportDialog ], (values) => {
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