import { useWelcomeDialogListener } from '@/components/dialog/welcome/welcome-events';
import { useMenuBarListener } from '@/components/menu/bar-app-events';

export type WorkspaceAction =
  | 'simulation-created'
  | 'simulation-deleted'
  | 'context-changed';

export class WorkspaceActionEvent extends Event {
  static readonly eventType = 'ok/workspace-action';
  constructor(public action: WorkspaceAction) {
    super(WorkspaceActionEvent.eventType);
  }
}

export type WorkspaceActionListener = (event: WorkspaceActionEvent) => void;

function dispatchWorkspaceAction(action: WorkspaceAction) {
  const event = new WorkspaceActionEvent(action);
  document.dispatchEvent(event);
}

export function useWorkspaceActionListener(listener: WorkspaceActionListener) {
  return useEventListener(document, WorkspaceActionEvent.eventType, listener);
}

export function useWorkspace() {
  const { getLoader } = useCircuitLoaders();
  const simulations = shallowRef<UseCircuitSimulationReturn[]>(
    shallowReactive([]),
  );
  const currentSimulation = shallowRef<UseCircuitSimulationReturn>();

  function openSimulation(sim: UseCircuitSimulationReturn) {
    if (!simulations.value.includes(sim)) {
      simulations.value.push(sim);
    }
    currentSimulation.value = sim;
    dispatchWorkspaceAction('context-changed');
  }

  function addNewSimulation(open: boolean = false) {
    const sim = useCircuitSimulation();
    simulations.value.push(sim);
    dispatchWorkspaceAction('simulation-created');
    if (open) {
      openSimulation(sim);
    }
    return sim;
  }

  function removeSimulation(sim: UseCircuitSimulationReturn) {
    const index = simulations.value.indexOf(sim);
    if (index !== -1) {
      simulations.value.splice(index, 1);
      if (currentSimulation.value === sim) {
        const nextSim =
          simulations.value[index] ?? simulations.value[index - 1] ?? undefined;
        openSimulation(nextSim);
      }
      dispatchWorkspaceAction('simulation-deleted');
    }
  }

  function openNewLevel(levelName: string, open: boolean = true) {
    const sim = addNewSimulation(open);
    const loader = getLoader(levelName);
    if (!loader) {
      throw new Error(`Unknown loader: ${levelName}`);
    }
    sim.field.loadBlank(loader.width, loader.height, loader.pinRows);
    sim.load(loader);
  }

  return {
    allSimulations: computed(() => simulations.value),
    currentSimulation: computed(() => currentSimulation.value),
    addNewSimulation,
    removeSimulation,
    openSimulation,
    openNewLevel,
  };
}
