import { Sequence } from "@/simulation";

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  reducer: (context: { state: TState, inputs: boolean[], frame: number }) => boolean[],
  initialState?: TState,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  reducer: (context: { state: TState, inputs: boolean[], frame: number }) => boolean[],
  maxLength: number,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  reducer: (context: { state: TState, inputs: boolean[], frame: number }) => boolean[],
  initialState: TState,
  maxLength: number,
): Sequence[];

function createSequencesFromInputs<TState extends object>(
  inputSequences: Sequence[],
  reducer: (context: { state: TState, inputs: boolean[], frame: number }) => boolean[],
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
  const outputSequences: Sequence[] = [];
  for (let frame = 0; frame < maxLength; frame++) {
    for (let i = 0; i < inputSequences.length; i++) {
      const seq = inputSequences[i];
      const newState = seq.getFrames()[frame];
      if (newState === undefined) {
        continue;
      }
      inputs[i] = newState;
    }
    const outputs = reducer({ state, inputs, frame });
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
