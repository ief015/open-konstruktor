import { type WatchHandle } from 'vue';

export type RouteLoaderParams = {
  levelKey?: string;
  designString?: string;
};

const watchHandler = ref<WatchHandle>();

export function useRouteLoader() {
  const route = useRoute();
  const loaders = useCircuitLoaders();
  const sim = useCircuitSimulator();
  const field = useFieldGraph();

  function loadRoute(params: RouteLoaderParams) {
    if (params.designString) {
      try {
        field.load(params.designString);
      } catch (e) {
        console.warn(`Failed to load design from URL`, e);
      }
    }
    if (params.levelKey) {
      try {
        const loader = loaders.getLoader(params.levelKey);
        sim.load(field.field.value, loader);
      } catch (e) {
        console.warn(`Failed to load level with key: ${params.levelKey}`, e);
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
    const level = sim.circuitFactory.value?.key;
    const design =
      field.field.value && !field.field.value.isEmpty(true)
        ? field.field.value.toSaveString()
        : undefined;
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
