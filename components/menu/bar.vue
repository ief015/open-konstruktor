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
        <button @click="onImport" :disabled="!importCode.length" class="font-bold">
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
import type { CircuitSimulationFactory } from "@/circuits";

const { field, load, loadBlank } = useFieldGraph();
const { load: loadSim } = useCircuitSimulator();
const { getLoader } = useCircuitLoaders();
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
        name: "Tutorial",
        menu: [
          { id: 'level:01 Introduction',            name: "01 Introduction" },
          { id: 'level:02 Metal, Silicon and Vias', name: "02 Metal, Silicon and Vias" },
          { id: 'level:03 PNP Gates',               name: "03 PNP Gates" },
          { id: 'level:04 NPN Gates',               name: "04 NPN Gates" },
          { id: 'level:05 Propagation Delay',       name: "05 Propagation Delay" },
        ],
      },
      {
        name: "Open-Konstruktor",
        menu: [
          {
            name: '01 - 10',
            menu: [
              { id: 'level:DUAL INVERTER GATE', name: "01 DUAL INVERTER GATE" },
              { id: 'level:2-INPUT AND GATE', name: "02 2-INPUT AND GATE" },
              { id: 'level:2-INPUT NAND GATE', name: "03 2-INPUT NAND GATE" },
              { id: 'level:2-INPUT OR GATE', name: "04 2-INPUT OR GATE" },
              { id: 'level:2-INPUT AND/NAND GATE', name: "05 2-INPUT AND/NAND GATE" },
              { id: 'level:2-INPUT OR/NOR GATE', name: "06 2-INPUT OR/NOR GATE" },
              
              { id: 'level:', name: "07" },
              { id: 'level:', name: "08" },
              { id: 'level:', name: "09" },

              { id: 'level:4-INPUT AND-OR GATE', name: "10 4-INPUT AND-OR GATE" },
            ],
          },
          {
            name: '11 - 20',
            menu: [
              { id: 'level:OM1SRL1 DUAL S-R LATCH', name: "14 OM1SRL1 DUAL S-R LATCH" },
              { id: 'level:OM1TL1 DUAL T LATCH', name: "15 OM1TL1 DUAL T LATCH" },
              { id: 'level:OM1DL1 DUAL D LATCH', name: "16 OM1DL1 DUAL D LATCH" },
              { id: 'level:OM1SRF1 DUAL S-R FLIP-FLOP', name: "17 OM1SRF1 DUAL S-R FLIP-FLOP" },
              { id: 'level:OM1TF1 DUAL T FLIP-FLOP', name: "18 OM1TF1 DUAL T FLIP-FLOP" },
              { id: 'level:OM1DF1 DUAL D FLIP-FLOP', name: "19 OM1DF1 DUAL D FLIP-FLOP" },
            ],
          },
          {
            name: '21 - 30',
            menu: [
              { id: 'level:DUAL 2-INPUT CLOCKED AND GATE', name: "21 DUAL 2-INPUT CLOCKED AND GATE" },
              { id: 'level:4-BIT PARITY CHECKER', name: "22 4-BIT PARITY CHECKER" },
              { id: 'level:ONE-HOT DETECTOR', name: "23 ONE-HOT DETECTOR" },
              { id: 'level:OM1SRAM1 SRAM CELL', name: "25 OM1SRAM1 SRAM CELL" },
            ],
          },
          {
            name: '31 - 40',
            menu: [
              { id: 'level:OC2C1 DUAL FULL COMPARATOR', name: "31 OC2C1 DUAL FULL COMPARATOR" },
              { id: 'level:OM2JL1 DUAL J-K LATCH', name: "32 OM2JL1 DUAL J-K LATCH" },
              { id: 'level:OM2JF1 DUAL J-K FLIP-FLOP', name: "33 OM2JF1 DUAL J-K FLIP-FLOP" },
            ],
          },
          {
            name: '41 - 50',
            menu: [
              { id: 'level:OM1S1 SRAM CELL', name: "41 OM1S1 SRAM CELL" },
            ],
          },
        ],
      },
      {
        name: "KOHCTPYKTOP",
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
        ],
      },
      {
        name: "Debugging",
        menu: [
          { id: 'level:Very large test',            name: "Very large test" },
        ],
      },
    ]
  },
];

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
  try {
    load(importCode.value);
    loadSim(field.value);
    showImportDialog.value = false;
  } catch (e: any) {
    alert(`Failed to import:\n${e.message ?? e}`);
  }
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
    const loader = getLoader(loaderKey);
    if (!loader) {
      throw new Error(`Unknown loader: ${loaderKey}`);
    }
    onLoadCircuit(loader);
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