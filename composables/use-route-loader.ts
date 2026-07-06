import type { UseCircuitSimulationReturn } from '@/composables/use-circuit-simulation';
import type { UseWorkspaceReturn } from '@/composables/use-workspace';
import { type ShallowRef, type WatchHandle } from 'vue';

export type RouteLoaderParams = {
  levelKey?: string;
  designString?: string;
};

const watchHandler = ref<WatchHandle>();

export function useRouteLoader(workspace: MaybeRef<UseWorkspaceReturn>) {
  const route = useRoute();
  const loaders = useCircuitLoaders();

  function loadRoute(params: RouteLoaderParams) {
    if (params.levelKey) {
      try {
        const loader = loaders.getLoader(params.levelKey);
        unref(workspace).openNewLevel(loader.key, params.designString);
      } catch (e) {
        console.warn(`Failed to load level with key: ${params.levelKey}`, e);
      }
    } else {
      if (params.designString) {
        try {
          const sim = unref(workspace).currentSimulation.value;
          const field = unref(sim?.field);
          field?.load(params.designString);
        } catch (e) {
          console.warn(`Failed to load design from URL`, e);
        }
      }
    }
  }

  function loadCurrentRoute() {
    const { level, design } = route.query;
    loadRoute({
      levelKey: level as string,
      designString: design as string,
    });
  }

  function buildURL(params: RouteLoaderParams) {
    const url = new URL(window.location.host);
    if (params.levelKey) {
      url.searchParams.set('level', params.levelKey);
    }
    if (params.designString) {
      url.searchParams.set('design', params.designString);
    }
    return url.toString();
  }

  function getCurrentURL() {
    const sim = unref(workspace).currentSimulation.value;
    if (!sim) throw new Error('No current simulation to get URL from');
    const level = sim.circuitFactory.value?.key;
    const field = unref(sim.field.field.value);
    const design =
      field && !field.isEmpty(true) ? field.toSaveString() : undefined;
    return buildURL({ levelKey: level, designString: design });
  }

  watchHandler.value?.();
  watchHandler.value = watch(route, loadCurrentRoute, { immediate: true });

  return {
    loadRoute,
    loadCurrentRoute,
    getCurrentURL,
  };
}
