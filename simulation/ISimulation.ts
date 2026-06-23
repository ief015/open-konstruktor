export abstract class ISimulation {
  /**
   * Step the simulation forward by one frame.
   * @returns `true` if the simulation is complete, `false` otherwise.
   */
  public abstract step(): boolean;

  /**
   * Reset the simulation to its initial state.
   */
  public abstract reset(): void;

  /**
   * Current frame of the simulation.
   */
  public abstract getCurrentFrame(): number;
}
