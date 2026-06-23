import {
  Network,
  Sequence,
  PinNode,
  getNodeState,
  KOHCTPYKTOPValidator,
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
export type RecordingMap<TNode extends NetworkNode = NetworkNode> = Map<
  TNode | ProbeInfo,
  Sequence
>;
export type ProbeMap<TNode extends NetworkNode = NetworkNode> = Map<
  ProbeInfo,
  TNode[]
>;

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

  private inputSequences: SequenceMap = new Map();
  private outputSequences: SequenceMap = new Map();
  private sequenceLength: number = 0;
  private defaultRuntime?: number;

  private probes: ProbeInfo[] = [];
  private probedNodes: ProbeMap<NetworkNode> = new Map();

  private currentFrame: number = 0;
  private recording: RecordingMap = new Map();
  private recordingLength: number = 0;

  protected validator: IValidator = new KOHCTPYKTOPValidator();

  constructor(network: Network, defaultRuntime?: number) {
    this.network = network;
    this.defaultRuntime = defaultRuntime;
  }

  public step(record: boolean = true): boolean {
    for (const [pin, sequence] of this.inputSequences) {
      const state = sequence.getFrames()[this.currentFrame];
      if (state !== undefined) {
        pin.active = state;
      }
    }
    this.network.step();
    record && this.recordFrame();
    return ++this.currentFrame >= this.getRunningLength();
  }

  public reset(clearRecordings: boolean = true) {
    for (const [pin, sequence] of this.inputSequences) {
      pin.active = sequence.getFrames()[0] ?? false;
    }
    for (const probe of this.probes) {
      const nodes = this.network.getNodesAt(probe.layerPosition, probe.layer);
      this.probedNodes.set(probe, nodes);
    }
    this.network.reset();
    clearRecordings && this.clearRecordings();
    this.currentFrame = 0;
  }

  public run(
    length: number = this.getRunningLength(),
    onPostStep?: (frame: number) => void,
    record: boolean = true,
  ) {
    this.reset(record);
    while (this.currentFrame < length) {
      const curFrame = this.currentFrame;
      this.step(record);
      onPostStep?.(curFrame);
    }
  }

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
    // Clear recordings
    this.reset();
    // Remap input/output sequences
    const oldPins = oldNet.getPinNodes();
    const newPins = network.getPinNodes();
    if (oldPins.length !== newPins.length) {
      this.clearInputSequences();
      this.clearOutputSequences();
    } else {
      // Remap sequences to new pins at same locations.
      const newInputSequences = new Map<PinNode, Sequence>();
      const newOutputSequences = new Map<PinNode, Sequence>();
      for (let i = 0; i < oldPins.length; i++) {
        const oldPin = oldPins[i];
        const newPin = newPins[i];
        const inputSequence = this.inputSequences.get(oldPin);
        if (inputSequence) {
          newInputSequences.set(newPin, inputSequence);
        }
        const outputSequence = this.outputSequences.get(oldPin);
        if (outputSequence) {
          newOutputSequences.set(newPin, outputSequence);
        }
      }
      this.inputSequences = newInputSequences;
      this.outputSequences = newOutputSequences;
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

  public getValidator(): IValidator {
    return this.validator;
  }

  public setValidator(validator: IValidator) {
    this.validator = validator;
  }

  public getRecording(node: NetworkNode): Readonly<Sequence> | null;
  public getRecording(probe: ProbeInfo): Readonly<Sequence> | null;
  public getRecording(
    nodeOrProbe: NetworkNode | ProbeInfo,
  ): Readonly<Sequence> | null {
    return this.recording.get(nodeOrProbe) ?? null;
  }

  /**
   * The length of the longest I/O sequence, in frames.
   */
  public getSequenceLength(): number {
    return this.sequenceLength;
  }

  /**
   * The length of recorded sequences, in frames.
   */
  public getRecordingLength(): number {
    return this.recordingLength;
  }

  public getRecordings(): Readonly<RecordingMap> {
    return this.recording;
  }

  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * The length of the simulation, in frames.
   * Either the default runtime, or the length of the longest sequence.
   */
  public getRunningLength(): number {
    return this.defaultRuntime ?? this.sequenceLength;
  }

  private updateSequenceLength() {
    const inputLengths = [...this.inputSequences.values()].map((s) =>
      s.getLength(),
    );
    const outputLengths = [...this.outputSequences.values()].map((s) =>
      s.getLength(),
    );
    this.sequenceLength = Math.max(...inputLengths, ...outputLengths, 0);
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

  public getProbeNodes(probe: ProbeInfo): NetworkNode[] {
    return this.probedNodes.get(probe) ?? [];
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
    this.probedNodes.delete(probe);
    this.recording.delete(probe);
  }

  public clearProbes() {
    for (const probe of this.probes) {
      this.recording.delete(probe);
    }
    this.probes = [];
    this.probedNodes.clear();
  }

  public getInputSequences(): Readonly<{ pin: PinNode; sequence: Sequence }[]> {
    return [...this.inputSequences.entries()].map(([pin, sequence]) => ({
      pin,
      sequence,
    }));
  }

  public setInputSequence(pin: PinNode | number, sequence: Sequence) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.inputSequences.set(pin, sequence);
    this.updateSequenceLength();
  }

  public removeInputSequence(pin: PinNode | number) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.inputSequences.delete(pin);
    this.updateSequenceLength();
  }

  public clearInputSequences() {
    this.inputSequences.clear();
    this.updateSequenceLength();
  }

  public getOutputSequences(): Readonly<
    { pin: PinNode; sequence: Sequence }[]
  > {
    return [...this.outputSequences.entries()].map(([pin, sequence]) => ({
      pin,
      sequence,
    }));
  }

  public setOutputSequence(pin: PinNode | number, sequence: Sequence) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.outputSequences.set(pin, sequence);
    this.updateSequenceLength();
  }

  public removeOutputSequence(pin: PinNode | number) {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    this.outputSequences.delete(pin);
    this.updateSequenceLength();
  }

  public clearOutputSequences() {
    this.outputSequences.clear();
    this.updateSequenceLength();
  }

  public getSequence(pin: PinNode | number): {
    input?: Readonly<Sequence>;
    output?: Readonly<Sequence>;
  } {
    if (typeof pin === 'number') {
      pin = this.network.getPinNode(pin);
    }
    return {
      input: this.inputSequences.get(pin),
      output: this.outputSequences.get(pin),
    };
  }

  public clearRecordings() {
    this.recording.clear();
    this.recordingLength = 0;
    const pins = this.network.getPinNodes();
    for (const pin of pins) {
      this.recording.set(pin, new Sequence());
    }
    for (const probe of this.probes) {
      this.recording.set(probe, new Sequence());
    }
  }

  private recordFrame() {
    const pins = this.network.getPinNodes();
    const frame = this.currentFrame;
    for (const pin of pins) {
      const state = pin.path?.state;
      const rec = this.recording.get(pin);
      if (rec && rec.getBack() != state) {
        rec.setFrame(frame, state);
      }
    }
    for (const [probe, nodes] of this.probedNodes) {
      const state = nodes.some(getNodeState);
      const rec = this.recording.get(probe);
      if (rec && rec.getBack() != state) {
        rec.setFrame(frame, state);
      }
    }
    this.recordingLength = Math.max(this.recordingLength, frame + 1);
  }

  public verify(): VerificationResult {
    const sequencePairs = [...this.outputSequences.entries()].map(
      ([pin, expected]) => {
        const actual = this.recording.get(pin);
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
        const actual = this.recording.get(pin);
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
        const pinRec = this.recording.get(pin)?.getFrames();
        let state = false;
        for (let frame = 0; frame < this.recordingLength; frame++) {
          state = pinRec?.[frame] === undefined ? state : !!pinRec[frame];
          line += state ? highSymbol : lowSymbol;
        }
        console.log(line);
      }
    } else {
      const sPadding = ' '.repeat(padding);
      const maxLengthName = Math.max(
        ...sortedPins.map((p) => p.label.length),
        String(this.recordingLength).length,
      );
      if (showLabels) {
        const pinNames = sortedPins.map((p) => p.label.padStart(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(sPadding));
      }
      const currentStates = new Map<PinNode, boolean>();
      for (const pin of sortedPins) {
        currentStates.set(pin, false);
      }
      for (let frame = 0; frame < this.recordingLength; frame++) {
        const sFrame = `${frame}`.padStart(maxLengthName);
        const pinStates = sortedPins.map((p) => {
          const s = this.recording.get(p)?.getFrames()[frame];
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
          const pinRec = this.recording.get(pin)?.getFrames();
          for (let frame = 0; frame < this.recordingLength; frame++) {
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
      for (let frame = 0; frame < this.recordingLength; frame++) {
        let line = '';
        line += `${frame}`.padStart(maxLengthName) + sPadding;
        for (const pin of sortedPins) {
          const states = pinStates.get(pin)!;
          const frameState = this.recording.get(pin)?.getFrames()[frame];
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
