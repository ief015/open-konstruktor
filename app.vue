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
      >
        <template #before="{ name }">
          <CircuitStatusLight
            class="px-1"
            :is-running="unref(getSimulationByName(name)?.isRunning)"
            :is-paused="unref(getSimulationByName(name)?.isPaused)"
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
        <div
          class="absolute inset-x-0 top-[1.5em] flex flex-row justify-center"
        >
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
import type { ShallowRef } from 'vue';

const config = useRuntimeConfig();
const status = useStatusBar();

// FIXME: useClipboard does not appear to be reliable when called in many places
const clipboard = useClipboard();
provide('clipboard', clipboard);

const simulations: ReturnType<typeof useCircuitSimulation>[] = shallowReactive(
  [],
);
const currentSimulation = shallowRef<ReturnType<typeof useCircuitSimulation>>();
provideCircuitSimulation(
  currentSimulation as ShallowRef<ReturnType<typeof useCircuitSimulation>>,
);

const currentTab = ref<string>();
const tabItems = computed<TabBarItem[]>(() => {
  const items: TabBarItem[] = simulations.map((sim) => ({
    name: String(sim.id),
    label: sim.circuitFactory.value?.label ?? `Untitled (${sim.id})`,
    closeable: true,
  }));
  return items;
});

watch(currentSimulation, (sim) => {
  currentTab.value = sim ? String(sim.id) : undefined;
});

function openNewSimulation(open: boolean = true) {
  const sim = useCircuitSimulation();
  simulations.push(sim);
  if (open) {
    currentSimulation.value = sim;
  }
  return sim;
}

const { getLoader } = useCircuitLoaders();
function loadLevel(levelName: string) {
  const sim = openNewSimulation();
  const loader = getLoader(levelName);
  if (!loader) {
    throw new Error(`Unknown loader: ${levelName}`);
  }
  sim.field.loadBlank(loader.width, loader.height, loader.pinRows);
  sim.load(loader);
}

function onSelectedTab(name: string) {
  const sim = simulations.find((sim) => String(sim.id) === name);
  if (sim) {
    currentSimulation.value = sim;
  }
}

function getSimulationByName(name: string) {
  return simulations.find((sim) => String(sim.id) === name);
}

function onCloseTab(name: string) {
  const index = simulations.findIndex((sim) => String(sim.id) === name);
  if (index >= 0) {
    const sim = simulations[index];
    simulations.splice(index, 1);
    if (currentSimulation.value === sim) {
      const nextSim = simulations[index] ?? simulations[index - 1] ?? undefined;
      currentSimulation.value = nextSim;
    }
  }
}

useMenuBarListener((event) => {
  const { id } = event;
  if (!id) return;
  if (id.startsWith('level/')) {
    const loaderKey = id.slice('level/'.length);
    loadLevel(loaderKey);
  }
});

useWelcomeDialogListener((event) => {
  switch (event.action) {
    case 'start-tutorial':
      loadLevel('Tutorial 01 Introduction');
      break;
  }
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
