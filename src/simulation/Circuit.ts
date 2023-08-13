import Network from "@/simulation/Network";
import PinNode from "@/simulation/PinNode";
import Sequence from "@/simulation/Sequence";

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

export type Sequences = Map<PinNode, Sequence>;
export type Recording = Map<PinNode, Sequence>;

const evenOddPinSort = (pins: PinNode[]) => {
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

export default class Circuit {

  private network: Network;

  private inputSequences: Sequences = new Map();
  private outputSequences: Sequences = new Map();
  private sequenceLength: number = 0;

  private currentFrame: number = 0;
  private recording: Recording = new Map();
  private recordingLength: number = 0;

  constructor(network: Network) {
    this.network = network;
  }

  public run(
    length: number = this.sequenceLength,
    onPostStep?: (frame: number) => void,
    record: boolean = true
  ) {
    this.network.reset();
    record && this.clearRecordings();
    for (this.currentFrame = 0; this.currentFrame < length; this.currentFrame++) {
      for (const [ pin, sequence ] of this.inputSequences) {
        const state = sequence.getFrames()[this.currentFrame];
        if (state !== undefined) {
          pin.active = state;
        }
      }
      this.network.step();
      record && this.recordFrame();
      onPostStep?.(this.currentFrame);
    }
  }

  public getNetwork(): Network {
    return this.network;
  }

  public getRecording(pin: PinNode): Readonly<Sequence> | null {
    return this.recording.get(pin) ?? null;
  }

  public getSequenceLength(): number {
    return this.sequenceLength;
  }

  public getRecordingLength(): number {
    return this.recordingLength;
  }

  public getRecordings(): Readonly<Recording> {
    return this.recording;
  }

  private updateSequenceLength() {
    const inputLengths = [ ...this.inputSequences.values() ].map(s => s.getLength());
    const outputLengths = [ ...this.outputSequences.values() ].map(s => s.getLength());
    this.sequenceLength = Math.max(...inputLengths, ...outputLengths, 0);
  }

  public setInputSequence(pin: PinNode, sequence: Sequence) {
    this.inputSequences.set(pin, sequence);
    this.updateSequenceLength();
  }

  public setOutputSequence(pin: PinNode, sequence: Sequence) {
    this.outputSequences.set(pin, sequence);
    this.updateSequenceLength();
  }

  public clearRecordings() {
    this.recording.clear();
    const pins = this.network.getPinNodes();
    for (const pin of pins) {
      this.recording.set(pin, new Sequence());
    }
  }

  private recordFrame() {
    const pins = this.network.getPinNodes();
    const frame = this.currentFrame;
    for (const pin of pins) {
      const state = pin.path?.state;
      const pinRec = this.recording.get(pin);
      if (pinRec && pinRec.getBack() != state) {
        pinRec.setFrame(frame, state);
      }
    }
    this.recordingLength = Math.max(this.recordingLength, frame + 1);
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
    const sortedPins = [ ...(filter ? pins.filter((p, i) => filter(i, p)) : pins) ];
    switch (pinOrder) {
      case 'even-odd':
        evenOddPinSort(sortedPins);
        break;
    }
    if (horizontal) {
      const maxLengthName = Math.max(...sortedPins.map(p => p.label.length));
      for (const pin of sortedPins) {
        let line = '';
        if (showLabels) {
          line += pin.label.padStart(maxLengthName) + ' ';
        }
        const pinRec = this.recording.get(pin)?.getFrames();
        let state = false;
        for (let frame = 0; frame < this.recordingLength; frame++) {
          state = pinRec?.[frame] === undefined ? state : !!(pinRec[frame]);
          line += state ? highSymbol : lowSymbol;
        }
        console.log(line);
      }
    } else {
      const sPadding = ' '.repeat(padding);
      const maxLengthName = Math.max(...sortedPins.map(p => p.label.length), String(this.recordingLength).length);
      if (showLabels) {
        const pinNames = sortedPins.map(p => p.label.padStart(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(sPadding));
      }
      const currentStates = new Map<PinNode, boolean>();
      for (const pin of sortedPins) {
        currentStates.set(pin, false);
      }
      for (let frame = 0; frame < this.recordingLength; frame++) {
        const sFrame = `${frame}`.padStart(maxLengthName);
        const pinStates = sortedPins.map(p => {
          const s = this.recording.get(p)?.getFrames()[frame];
          if (s !== undefined) {
            currentStates.set(p, s);
            return s;
          }
          return currentStates.get(p) ?? false;
        });
        const sLine = [sFrame, ...pinStates.map(s => (s ? highSymbol : lowSymbol).padStart(maxLengthName))].join(sPadding);
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
    const sortedPins = [ ...(filter ? pins.filter((p, i) => filter(i, p)) : pins) ];
    switch (pinOrder) {
      case 'even-odd':
        evenOddPinSort(sortedPins);
        break;
    }
    if (horizontal) {
      const maxLengthName = Math.max(...sortedPins.map(p => p.label.length));
      for (const pin of sortedPins) {
        for (const isTop of [ true, false ]) {
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
            const state: boolean = (pinRec?.[frame] === undefined) ? lastState : !!(pinRec[frame]);
            if (state !== lastState) {
              line += isTop ? (state ? '┌' : '┐') : (state ? '┘' : '└');
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
      const maxLengthName = Math.max(...sortedPins.map(p => p.label.length), 2);
      const sPadding = ' '.repeat(padding);
      if (showLabels) {
        const pinNames = sortedPins.map(p => p.label.padEnd(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(sPadding));
      }
      const pinStates = new Map<PinNode, { cur: boolean, prev: boolean }>();
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