<template>
  <NuxtLayout class="max-w-screen max-h-screen">
    <template #top>
      <div class="h-[1.5em] bottom-border flex flex-row select-none">
        <div class="font-ttw ml-2 mr-3 self-center">open-konstruktor</div>
        <div class="flex-1">
          <MenuBarApp />
        </div>
      </div>
    </template>
    <template #left>
      <div class="w-[10em] h-full right-border flex flex-col">
        <template v-if="currentSimulation">
          <div class="text-sm font-ttw text-center m-1 select-none">
            Designs
          </div>
          <ToolboxDesignSelect class="flex-1" />
          <div class="text-sm font-ttw text-center m-1 select-none">
            Snippets
          </div>
          <ToolboxSnippetsSelect class="flex-1" />
        </template>
      </div>
    </template>
    <div class="flex flex-col h-full">
      <TabBar
        class="bottom-border"
        v-model="currentTab"
        :items="tabItems"
        @selected="onSelectedTab"
        @close="onCloseTab"
        @label-dbl-click="onLabelDblClick"
      >
        <template #before="{ name }">
          <CircuitStatusLight
            class="px-1"
            :is-running="unref(getSimulationByName(name)?.isRunning)"
            :is-paused="unref(getSimulationByName(name)?.isPaused)"
          />
        </template>
        <template #label="{ name }">
          <input
            v-if="editTab === name"
            v-model="editTabModel"
            autofocus
            @blur="onSubmitEditTab"
            @keydown.enter="onSubmitEditTab"
          />
        </template>
      </TabBar>
      <div class="flex-1 relative bg-neutral-900">
        <div class="flex flex-col h-full" v-if="currentSimulation">
          <div class="flex-1 overflow-hidden">
            <CircuitField />
          </div>
          <div class="top-border">
            <CircuitScope />
          </div>
          <div class="top-border py-2 bg-neutral-800">
            <CircuitControls class="w-full h-full" />
          </div>
        </div>
        <div class="absolute inset-x-0 top-0 flex flex-row justify-center">
          <DialogInfoBox class="m-2 w-[1000px]" v-if="currentSimulation" />
          <DialogWelcome />
        </div>
      </div>
    </div>
    <template #right>
      <div class="w-[5em] h-full left-border flex flex-col">
        <template v-if="currentSimulation">
          <div class="text-sm font-ttw text-center m-1 select-none">
            Toolbox
          </div>
          <ToolboxControls class="mx-2" />
        </template>
      </div>
    </template>
    <template #bottom>
      <div class="h-[1.5em] top-border">
        <div class="flex flex-row justify-between items-center h-full text-sm">
          <div class="opacity-75 pl-1 text-nowrap overflow-hidden">
            {{ status.text.value }}
          </div>
          <div class="opacity-30 pr-1">
            <a
              :href="config.public.appHomepage"
              target="_blank"
              rel="noopener noreferrer"
              >{{ config.public.appVersion }}</a
            >
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useWelcomeDialogListener } from '@/components/dialog/welcome/welcome-events';
import { useMenuBarListener } from '@/components/menu/bar-app-events';
import type { TabBarItem } from '@/components/tab/bar-item.vue';
import type { UseCircuitSimulationReturn } from '@/composables/use-circuit-simulation';
import type { ShallowRef } from 'vue';

const config = useRuntimeConfig();
const status = useStatusBar();

// FIXME: useClipboard does not appear to be reliable when called in many places
const clipboard = useClipboard();
provide('clipboard', clipboard);

const workspace = useWorkspace();
const {
  allSimulations,
  currentSimulation,
  addNewSimulation,
  removeSimulation,
  openSimulation,
  openNewLevel,
} = workspace;
const routeLoader = useRouteLoader(workspace);

provideCircuitSimulation(
  currentSimulation as ShallowRef<UseCircuitSimulationReturn>,
);

const currentTab = ref<string>();
const editTab = ref<string>();
const editTabModel = ref<string>('');
const tabItems = computed(() => {
  const items = allSimulations.value.map(
    (sim) =>
      ({
        name: String(sim.id.value),
        label: sim.name.value || `Untitled ${sim.id.value}`,
        closeable: true,
      }) as TabBarItem,
  );
  return reactive(items);
});

function getSimulationByName(name: string) {
  return allSimulations.value.find((sim) => String(sim.id.value) === name);
}

function onSelectedTab(name: string) {
  const sim = allSimulations.value.find((sim) => String(sim.id.value) === name);
  if (sim) {
    openSimulation(sim);
  }
}

function onCloseTab(name: string) {
  const sim = allSimulations.value.find((sim) => String(sim.id.value) === name);
  if (sim) {
    removeSimulation(sim);
  }
}

function onLabelDblClick(name: string) {
  const sim = allSimulations.value.find((sim) => String(sim.id.value) === name);
  if (sim) {
    editTab.value = name;
    editTabModel.value = sim.name.value;
  }
}

function duplicateCurrentSimulation() {
  if (!currentSimulation.value) return;
  const field = currentSimulation.value.field.field;
  const factory = currentSimulation.value.circuitFactory.value;
  const design = field.value.toSaveString();
  const sim = addNewSimulation(true);
  sim.load(factory);
  sim.field.load(design);
}

function onSubmitEditTab() {
  if (editTab.value) {
    const sim = allSimulations.value.find(
      (sim) => String(sim.id.value) === editTab.value,
    );
    if (sim) {
      const newName = editTabModel.value.trim();
      if (newName) {
        sim.name.value = newName;
      }
    }
  }
  editTab.value = undefined;
}

useMenuBarListener((event) => {
  const { id } = event;
  if (!id) return;
  if (id.startsWith('level/')) {
    const loaderKey = id.slice('level/'.length);
    openNewLevel(loaderKey);
    return;
  }
  switch (id) {
    case 'file/copy-url': {
      const url = routeLoader.getCurrentURL();
      clipboard.copy(url).then(() => {
        console.log('Copied URL to clipboard', url);
      });
      break;
    }
    case 'edit/duplicate':
      duplicateCurrentSimulation();
      break;
  }
});

useWelcomeDialogListener((event) => {
  switch (event.action) {
    case 'start-tutorial':
      openNewLevel('Tutorial 01 Introduction');
      break;
  }
});

watch(currentSimulation, (sim) => {
  currentTab.value = sim ? String(sim.id.value) : undefined;
});
</script>

<style scoped>
.bottom-border {
  border-bottom: 1px solid black;
}
.top-border {
  border-top: 1px solid black;
}
.left-border {
  border-left: 1px solid black;
}
.right-border {
  border-right: 1px solid black;
}
</style>
