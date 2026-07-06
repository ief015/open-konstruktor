import { useWelcomeDialogListener } from '@/components/dialog/welcome/welcome-events';
import { useMenuBarListener } from '@/components/menu/bar-app-events';

export type WorkspaceAction =
  | 'simulation-created'
  | 'simulation-deleted'
  | 'context-changed';

export class WorkspaceActionEvent extends Event {
  static readonly eventType = 'ok/workspace-action';
  constructor(
    public action: WorkspaceAction,
    public simulation: UseCircuitSimulationReturn | null = null,
  ) {
    super(WorkspaceActionEvent.eventType);
  }
}

export type WorkspaceActionListener = (event: WorkspaceActionEvent) => void;

function dispatchWorkspaceAction(
  action: WorkspaceAction,
  simulation: UseCircuitSimulationReturn | null = null,
) {
  const event = new WorkspaceActionEvent(action, simulation);
  document.dispatchEvent(event);
}

export function useWorkspaceActionListener(listener: WorkspaceActionListener) {
  return useEventListener(document, WorkspaceActionEvent.eventType, listener);
}

export function useWorkspace() {
  const { getLoader } = useCircuitLoaders();
  const simulations = shallowReactive<UseCircuitSimulationReturn[]>([]);
  const currentSimulation = shallowRef<UseCircuitSimulationReturn>();

  function openSimulation(sim: UseCircuitSimulationReturn) {
    if (!simulations.includes(sim)) {
      simulations.push(sim);
    }
    currentSimulation.value = sim;
    dispatchWorkspaceAction('context-changed', sim);
  }

  function addNewSimulation(open: boolean = false) {
    const sim = useCircuitSimulation();
    simulations.push(sim);
    dispatchWorkspaceAction('simulation-created', sim);
    if (open) {
      openSimulation(sim);
    }
    return sim;
  }

  function removeSimulation(sim: UseCircuitSimulationReturn) {
    const index = simulations.indexOf(sim);
    if (index !== -1) {
      simulations.splice(index, 1);
      if (currentSimulation.value === sim) {
        const nextSim =
          simulations[index] ?? simulations[index - 1] ?? undefined;
        if (nextSim) {
          openSimulation(nextSim);
        } else {
          currentSimulation.value = undefined;
        }
      }
      dispatchWorkspaceAction('simulation-deleted', sim);
    }
  }

  function openNewLevel(
    levelName: string,
    designString?: string,
    open: boolean = true,
  ) {
    const sim = addNewSimulation(open);
    const loader = getLoader(levelName);
    if (!loader) {
      throw new Error(`Unknown loader: ${levelName}`);
    }
    if (designString) {
      sim.field.load(designString);
    } else {
      sim.field.loadBlank(loader.width, loader.height, loader.pinRows);
    }
    sim.load(loader);
  }

  return {
    allSimulations: computed(() => simulations),
    currentSimulation: computed(() => currentSimulation.value),
    addNewSimulation,
    removeSimulation,
    openSimulation,
    openNewLevel,
  };
}

export type UseWorkspaceReturn = ReturnType<typeof useWorkspace>;
