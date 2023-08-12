import Network from "@/simulation/Network";
import PinNode from "@/simulation/PinNode";

export type PinState = {
  pin: PinNode;
  state: boolean;
};

export type KeyFrame = PinState[];

export type PinStateHistory = boolean[];
export type StateHistory = PinStateHistory[];

export type PrintPinOrdering = 'none' | 'even-odd';
export type PinFilter = (id: number, pin: PinNode) => boolean;
export type PinSort = (id: number, pin: PinNode) => number;

export interface PrintHistoryOptions {
  highSymbol?: string;
  lowSymbol?: string;
  showLabels?: boolean;
  pinOrder?: PrintPinOrdering;
  padding?: number;
  horizontal?: boolean;
  filter?: PinFilter;
}

export interface PrintHistoryScopeOptions {
  showLabels?: boolean;
  padding?: number;
  pinOrder?: PrintPinOrdering;
  horizontal?: boolean;
  filter?: PinFilter;
}

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

export default class Timeline {

  private network: Network;
  private keyframes: KeyFrame[] = [];

  private history: StateHistory = [];
  private historyLength: number = 0;

  constructor(network: Network) {
    this.network = network;
  }

  public addKeyFrame(frame: number, pin: PinNode, state: boolean) {
    if (!pin) {
      throw new Error(`Invalid pin: ${pin}`);
    }
    const keyframe = this.keyframes[frame] = this.keyframes[frame] ?? [];
    keyframe.push({ pin, state });
    
  }

  public addVCC(...pin: PinNode[]) {
    for (const p of pin) {
      this.addKeyFrame(0, p, true);
    }
  }

  public addPulseRange(start: number, end: number, ...pins: PinNode[]) {
    for (const p of pins) {
      this.addKeyFrame(start, p, true);
      this.addKeyFrame(end, p, false);
    }
  }

  public addPulse(frame: number, duration: number, ...pins: PinNode[]) {
    return this.addPulseRange(frame, frame + duration, ...pins);
  }

  public addTogglePoints(pin: PinNode, ...frames: number[]) {
    let state = true;
    for (const frame of frames) {
      this.addKeyFrame(frame, pin, state);
      state = !state;
    }
  }

  public addOscillation(frame: number, numPulses: number, highDuration: number, lowDuration: number, ...pins: PinNode[]) {
    for (let i = 0; i < numPulses; i++) {
      this.addPulse(frame + i * (highDuration + lowDuration), highDuration, ...pins);
    }
  }

  public run(length?: number, onPostStep?: (frame: number) => void, recordHistory: boolean = true) {
    this.network.reset();
    recordHistory && this.clearHistory();
    for (let frame = 0; frame < (length ?? this.keyframes.length); frame++) {
      const keyframe = this.keyframes[frame];
      if (keyframe) {
        for (const action of keyframe) {
          action.pin.active = action.state;
        }
      }
      this.network.step();
      recordHistory && this.recordFrame(frame);
      onPostStep?.(frame);
    }
  }

  public getHistory(): Readonly<StateHistory> {
    return this.history;
  }

  public clearHistory() {
    this.history.splice(0, this.history.length);
    const pins = this.network.getPinNodes();
    for (let pinIndex = 0; pinIndex < pins.length; pinIndex++) {
      this.history[pinIndex] = [];
    }
  }

  private recordFrame(frame: number) {
    const pins = this.network.getPinNodes();
    for (let pinIndex = 0; pinIndex < pins.length; pinIndex++) {
      const pinHistory = this.history[pinIndex];
      pinHistory[frame] = !!(pins[pinIndex].path?.state);
    }
    this.historyLength = Math.max(this.historyLength, frame + 1);
  }

  public printHistory(options: PrintHistoryOptions = {}) {
    const {
      highSymbol = '1',
      lowSymbol = '-',
      showLabels = true,
      pinOrder = 'none',
      padding = 0,
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
        const pinId = pins.indexOf(pin);
        let line = '';
        if (showLabels) {
          line += pin.label.padStart(maxLengthName) + ' ';
        }
        const pinHistory = this.history[pinId];
        for (let frame = 0; frame < this.historyLength; frame++) {
          const state = !!(pinHistory[frame]);
          line += state ? highSymbol : lowSymbol;
        }
        console.log(line);
      }
    } else {
      const maxLengthName = Math.max(...sortedPins.map(p => p.label.length), String(this.history.length).length);
      if (showLabels) {
        const pinNames = sortedPins.map(p => p.label.padStart(maxLengthName));
        console.log([' '.repeat(maxLengthName), ...pinNames].join(' '));
      }
      for (let frame = 0; frame < this.historyLength; frame++) {
        const sFrame = `${frame}`.padStart(maxLengthName);
        const pinStates = sortedPins.map(p => this.history[pins.indexOf(p)][frame]);
        const sLine = pinStates.map(s => (s ? highSymbol : lowSymbol).padStart(maxLengthName)).join(' ');
        console.log(`${sFrame} ${sLine}`);
      }
    }
  }

  public printHistoryScope(options: PrintHistoryScopeOptions = {}) {
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
        const pinId = pins.indexOf(pin);
        for (const isTop of [ true, false ]) {
          let line = '';
          if (showLabels) {
            if (!isTop) {
              line += pin.label.padStart(maxLengthName) + ' ';
            } else {
              line += ' '.repeat(maxLengthName) + ' ';
            }
          }
          let lastState = false;
          const pinHistory = this.history[pinId];
          for (let frame = 0; frame < this.historyLength; frame++) {
            const state = !!(pinHistory[frame]);
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
      for (let frame = 0; frame < this.historyLength; frame++) {
        let line = '';
        line += `${frame}`.padStart(maxLengthName) + sPadding;
        for (const pin of sortedPins) {
          const pinId = pins.indexOf(pin);
          const state = !!(this.history[pinId][frame]);
          const lastState = !!(this.history[pinId][frame - 1]);
          if (state !== lastState) {
            line += (state ? '└┐' : '┌┘').padEnd(maxLengthName) + sPadding;
          } else {
            line += (state ? '┆│' : '│ ').padEnd(maxLengthName) + sPadding;
          }
        }
        console.log(line);
      }
    }
  }

}
