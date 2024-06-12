import { Sequence } from "@/simulation";

interface SequencerContext<TState extends object> {
  /**
   * The current state of the sequencer.
   */
  state: TState;
  /**
   * Input values for each input sequence in the current frame.
   */
  inputs: boolean[];
  /**
   * The changes of each input since the last frame.
   * 1: input was set to true
   * 0: input was not changed
   * -1: input was set to false
   */
  deltas: number[];
  /**
   * The current frame number.
   */
  frame: number;
}

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  mapper: (context: SequencerContext<TState>) => boolean[],
  initialState?: TState,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  mapper: (context: SequencerContext<TState>) => boolean[],
  maxLength: number,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  mapper: (context: SequencerContext<TState>) => boolean[],
  initialState: TState,
  maxLength: number,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  mapper: (context: SequencerContext<TState>) => boolean[],
  initialState?: number|TState,
  maxLength?: number,
): Sequence[] {
  if (typeof initialState === 'number') {
    maxLength = initialState;
    initialState = <TState>{};
  }
  const state = <TState>{ ...initialState };
  maxLength = maxLength || inputSequences.reduce((max, seq) => Math.max(max, seq.getLength()), 0);
  const inputs = inputSequences.map(seq => seq.getFront());
  const deltas: number[] = [];
  const outputSequences: Sequence[] = [];
  for (let frame = 0; frame < maxLength!; frame++) {
    for (let i = 0; i < inputSequences.length; i++) {
      const seq = inputSequences[i];
      const newState = seq.getFrames()[frame];
      const lastState = inputs[i];
      deltas[i] = (newState !== lastState) ? (newState ? 1 : -1) : 0;
      if (newState === undefined) {
        continue;
      }
      inputs[i] = newState;
    }
    const outputs = mapper({ state, inputs, deltas, frame });
    for (let i = 0; i < outputs.length; i++) {
      const seq = outputSequences[i] ?? new Sequence();
      if (seq.getBack() !== outputs[i]) {
        seq.setFrame(frame, outputs[i]);
      }
      outputSequences[i] = seq;
    }
  }
  return outputSequences;
}

export default createSequencesFromInputs;
