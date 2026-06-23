import {
  Network,
  Sequence,
  PinNode,
  getNodeState,
  KOHCTPYKTOPValidator,
  NodeSequencer,
  SequenceRecorder,
  type RecordableFn,
  type GraphLayer,
  type NetworkNode,
  type Point,
  type IValidator,
  type VerificationResult,
} from '@/simulation';

export type PrintPinOrdering = 'none' | 'even-odd';
export type PinFilter = (id: number, pin: PinNode) => boolean;
export type PinSort = (id: number, pin: PinNode) => number;

export interface PrintRecordingOptions {
  highSymbol?: string;
  lowSymbol?: string;
  showLabels?: boolean;
  pinOrder?: PrintPinOrdering;
  padding?: number;
  horizontal?: boolean;
  filter?: PinFilter;
}

export interface PrintRecordingScopeOptions {
  showLabels?: boolean;
  padding?: number;
  pinOrder?: PrintPinOrdering;
  horizontal?: boolean;
  filter?: PinFilter;
}

export interface ProbeInfo {
  label: string;
  layer?: GraphLayer;
  layerPosition: Point;
}

export type SequenceMap<TNode extends NetworkNode = PinNode> = Map<
  TNode,
  Sequence
>;
export type ProbeMap = Map<ProbeInfo, RecordableFn>;

function evenOddPinSort(pins: PinNode[]) {
  pins.sort((a, b) => {
    const aid = pins.indexOf(a);
    const bid = pins.indexOf(b);
    if (aid % 2 === 0 && bid % 2 === 1) {
      return -1;
    } else if (aid % 2 === 1 && bid % 2 === 0) {
      return 1;
    } else {
      return aid - bid;
    }
  });
}

export class CircuitSimulation {
  private network: Network;

  private probes: ProbeInfo[] = [];
  private probedNodes: ProbeMap = new Map();

  protected validator: IValidator = new KOHCTPYKTOPValidator();
  protected sequencer: NodeSequencer;
  protected recorder = new SequenceRecorder();
  /** Expected output sequences for pins. */
  protected outputSequences: SequenceMap = new Map();

  constructor(network: Network, defaultRuntime?: number) {
    this.network = network;
    this.sequencer = new NodeSequencer(defaultRuntime);
  }

  /**
   * Steps the simulation by one frame.
   * @returns `true` if the simulation has reached the end, `false` otherwise.
   */
  public step(record: boolean = true): boolean {
    const currentFrame = this.sequencer.getCurrentFrame();
    if (!this.sequencer.step()) {
      this.network.step();
      record && this.recorder.record(currentFrame);
      return false;
    }
    return true;
  }

  /** Reset the simulation. */
  public reset(resetRecordings: boolean = true) {
    this.sequencer.reset();
    this.updateProbedNodes();
    this.network.reset();
    resetRecordings && this.recorder.reset();
  }

  /** Runs the simulation for a specified length. */
  public run(
    length: number = this.getRunningLength(),
    onPostStep?: (frame: number) => void,
    record: boolean = true,
  ) {
    this.reset(record);
    while (true) {
      const curFrame = this.sequencer.getCurrentFrame();
      if (curFrame >= length) break;
      const done = this.step(record);
      onPostStep?.(curFrame);
      if (done) break;
    }
  }

  /** Network being simulated. */
  public getNetwork(): Network {
    return this.network;
  }

  /**
   * Sets the network to simulate.
   * This will reset the simulation and clear all recordings.
   * If the pin count varies, the input and output sequences will be cleared,
   * else they will be remapped to the new pins.
   */
  public setNetwork(network: Network) {
    const oldNet = this.network;
    this.network = network;
    // Reset sim and clear recordings
    this.recorder.clear();
    this.reset();
    // Remap input/output sequences
    const oldPins = oldNet.getPinNodes();
    const newPins = network.getPinNodes();
    if (oldPins.length !== newPins.length) {
      this.sequencer.clear();
      this.outputSequences.clear();
    } else {
      // Remap sequences to new pins at same locations.
      for (let i = 0; i < oldPins.length; i++) {
        const oldPin = oldPins[i];
        const newPin = newPins[i];
        const { input, output } = this.getPinSequence(oldPin);
        if (input) {
          this.sequencer.remove(input, oldPin);
          this.sequencer.add(input, newPin);
        }
        if (output) {
          this.outputSequences.delete(oldPin);
          this.outputSequences.set(newPin, output);
          this.recorder.add(newPin);
        }
      }
      // Remap pin info.
      for (let i = 0; i < oldPins.length; i++) {
        const oldPin = oldPins[i];
        const newPin = newPins[i];
        newPin.label = oldPin.label;
        newPin.active = oldPin.active;
        newPin.isVCC = oldPin.isVCC;
      }
    }
  }

  /** Recorder for produced outputs and probes. */
  public getRecorder(): SequenceRecorder {
    return this.recorder;
  }

  /** Input pin sequencer. */
  public getSequencer(): NodeSequencer {
    return this.sequencer;
  }

  /** Validator for circuit verification and grading. */
  public getValidator(): IValidator {
    return this.validator;
  }

  /** Set validator for circuit verification and grading. */
  public setValidator(validator: IValidator) {
    this.validator = validator;
  }

  /** Get current simulation frame. */
  public getCurrentFrame(): number {
    return this.sequencer.getCurrentFrame();
  }

  /**
   * The length of the simulation, in frames.
   * Either the default runtime, or the length of the longest sequence.
   */
  public getRunningLength(): number {
    return this.sequencer.getLength();
  }

  public getProbes(): readonly ProbeInfo[] {
    return this.probes;
  }

  public getProbesAt(point: Point, layer?: GraphLayer): ProbeInfo[] {
    return this.probes.filter(
      (probe) =>
        (layer === undefined || probe.layer === layer) &&
        probe.layerPosition[0] === point[0] &&
        probe.layerPosition[1] === point[1],
    );
  }

  public addProbe(probe: ProbeInfo) {
    this.probes.push(probe);
  }

  public addProbeAt(
    point: Point,
    layer?: GraphLayer,
    label?: string,
  ): ProbeInfo {
    const probe: ProbeInfo = {
      layer,
      layerPosition: point,
      label: label ?? `Probe ${point[0]},${point[1]}`,
    };
    this.addProbe(probe);
    return probe;
  }

  public removeProbe(probe: ProbeInfo): void {
    const index = this.probes.indexOf(probe);
    if (index !== -1) {
      this.probes.splice(index, 1);
    }
    const recordable = this.probedNodes.get(probe);
    if (recordable) this.recorder.remove(recordable);
    this.probedNodes.delete(probe);
  }

  public clearProbes() {
    for (const probe of this.probes) {
      const recordable = this.probedNodes.get(probe);
      if (recordable) this.recorder.remove(recordable);
    }
    this.probes = [];
    this.probedNodes.clear();
  }

  protected updateProbedNodes() {
    this.probedNodes.clear();
    for (const probe of this.probes) {
      const nodes = this.network.getNodesAt(probe.layerPosition, probe.layer);
      this.probedNodes.set(probe, (frame) => nodes.some(getNodeState));
    }
  }

  public setInputSequence(pin: PinNode | number, sequence: Sequence) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.sequencer.add(sequence, pin);
  }

  public setOutputSequence(pin: PinNode | number, sequence: Sequence) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.outputSequences.set(pin, sequence);
    this.recorder.add(pin);
  }

  public getPinSequence(pin: PinNode | number): {
    input?: Sequence;
    output?: Sequence;
  } {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    return {
      input: this.sequencer.findNodeSequence(pin),
      output: this.outputSequences.get(pin),
    };
  }

  public getPinRecording(pin: PinNode | number): Readonly<Sequence> | null {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    return this.recorder.get(pin) ?? null;
  }

  public getProbeRecording(probe: ProbeInfo): Readonly<Sequence> | null {
    const recordable = this.probedNodes.get(probe);
    return (recordable && this.recorder.get(recordable)) ?? null;
  }

  public verify(): VerificationResult {
    const sequencePairs = [...this.outputSequences.entries()].map(
      ([pin, expected]) => {
        const actual = this.recorder.get(pin);
        if (!actual) throw new Error(`No recording found for pin ${pin.label}`);
        return { expected, actual };
      },
    );
    return this.validator.verify(sequencePairs, this.getRunningLength());
  }

  /**
   * Find verification errors for all pins on a specific frame.
   * @param frame Frame to verify.
   * @returns Array of sequence pairs that do not match on the given frame.
   */
  public findFrameVerificationErrors(frame: number) {
    const sequencePairs = [...this.outputSequences.entries()].map(
      ([pin, expected]) => {
        const actual = this.recorder.get(pin);
        if (!actual) throw new Error(`No recording found for pin ${pin.label}`);
        return { expected, actual, pin };
      },
    );
    return sequencePairs
      .map((pair) => {
        const isEq = this.validator.isFrameEqual(
          pair.expected,
          pair.actual,
          frame,
        );
        return !isEq ? pair : null;
      })
      .filter((e) => e !== null);
  }

  public printHistory(options: PrintRecordingOptions = {}) {
    const {
      highSymbol = '1',
      lowSymbol = '-',
      showLabels = true,
      pinOrder = 'none',
      padding = 1,
      horizontal = false,
      filter,
    } = options;
    const pins = this.network.getPinNodes();
    const sortedPins = [
      ...(filter ? pins.filter((p, i) => filter(i, p)) : pins),
    ];
    switch (pinOrder) {
      case 'even-odd':
        evenOddPinSort(sortedPins);
        break;
    }
    if (horizontal) {
      const maxLengthName = Math.max(...sortedPins.map((p) => p.label.length));
      for (const pin of sortedPins) {
        let line = '';
        if (showLabels) {
          line += pin.label.padStart(maxLengthName) + ' ';
        }
        const pinRec = this.recorder.get(pin)?.getFrames();
        let state = false;
        const recLen = this.recorder.getRecordingLength();
        for (let frame = 0; frame < recLen; frame++) {
          state = pinRec?.[frame] === undefined ? state : !!pinRec[frame];
          line += state ? highSymbol : lowSymbol;
        }
        console.log(line);
      }
    } else {
      const sPadding = ' '.repeat(padding);
      const maxLengthName = Math.max(
        ...sortedPins.map((p) => p.label.length),
        String(this.recorder.getRecordingLength()).length,
      );
      if (showLabels) {
        const pinNames = sortedPins.map((p) => p.label.padStart(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(sPadding));
      }
      const currentStates = new Map<PinNode, boolean>();
      for (const pin of sortedPins) {
        currentStates.set(pin, false);
      }
      const recLen = this.recorder.getRecordingLength();
      for (let frame = 0; frame < recLen; frame++) {
        const sFrame = `${frame}`.padStart(maxLengthName);
        const pinStates = sortedPins.map((p) => {
          const s = this.recorder.get(p)?.getFrames()[frame];
          if (s !== undefined) {
            currentStates.set(p, s);
            return s;
          }
          return currentStates.get(p) ?? false;
        });
        const sLine = [
          sFrame,
          ...pinStates.map((s) =>
            (s ? highSymbol : lowSymbol).padStart(maxLengthName),
          ),
        ].join(sPadding);
        console.log(`${sLine}`);
      }
    }
  }

  public printHistoryScope(options: PrintRecordingScopeOptions = {}) {
    const {
      showLabels = true,
      pinOrder = 'none',
      padding = 2,
      horizontal = false,
      filter,
    } = options;
    const pins = this.network.getPinNodes();
    const sortedPins = [
      ...(filter ? pins.filter((p, i) => filter(i, p)) : pins),
    ];
    switch (pinOrder) {
      case 'even-odd':
        evenOddPinSort(sortedPins);
        break;
    }
    if (horizontal) {
      const maxLengthName = Math.max(...sortedPins.map((p) => p.label.length));
      for (const pin of sortedPins) {
        for (const isTop of [true, false]) {
          let line = '';
          if (showLabels) {
            if (!isTop) {
              line += pin.label.padStart(maxLengthName) + ' ';
            } else {
              line += ' '.repeat(maxLengthName + 1);
            }
          }
          let lastState = false;
          const pinRec = this.recorder.get(pin)?.getFrames();
          const recLen = this.recorder.getRecordingLength();
          for (let frame = 0; frame < recLen; frame++) {
            const state: boolean =
              pinRec?.[frame] === undefined ? lastState : !!pinRec[frame];
            if (state !== lastState) {
              line += isTop ? (state ? '┌' : '┐') : state ? '┘' : '└';
              lastState = state;
            } else {
              if ((state && isTop) || (!state && !isTop)) {
                line += '─';
              } else {
                line += ' ';
              }
            }
          }
          console.log(line);
        }
      }
    } else {
      const maxLengthName = Math.max(
        ...sortedPins.map((p) => p.label.length),
        2,
      );
      const sPadding = ' '.repeat(padding);
      if (showLabels) {
        const pinNames = sortedPins.map((p) => p.label.padEnd(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(sPadding));
      }
      const pinStates = new Map<PinNode, { cur: boolean; prev: boolean }>();
      for (const pin of sortedPins) {
        pinStates.set(pin, { cur: false, prev: false });
      }
      const recLen = this.recorder.getRecordingLength();
      for (let frame = 0; frame < recLen; frame++) {
        let line = '';
        line += `${frame}`.padStart(maxLengthName) + sPadding;
        for (const pin of sortedPins) {
          const states = pinStates.get(pin)!;
          const frameState = this.recorder.get(pin)?.getFrames()[frame];
          if (frameState !== undefined) {
            states.cur = frameState;
          }
          const { cur, prev } = states;
          if (cur !== prev) {
            line += (cur ? '└┐' : '┌┘').padEnd(maxLengthName) + sPadding;
          } else {
            line += (cur ? '┆│' : '│ ').padEnd(maxLengthName) + sPadding;
          }
          states.prev = cur;
        }
        console.log(line);
      }
    }
  }
}
