import Network from "./Network";
import PinNode from "./PinNode";

export type PinState = {
  pin: PinNode;
  state: boolean;
};

export type KeyFrame = PinState[];

export type HistoryFrame = {
  frame: number;
  states: readonly PinState[];
};

export default class Timeline {

  private network: Network;
  private keyframes: KeyFrame[] = [];

  private history: HistoryFrame[] = [];

  constructor(network: Network) {
    this.network = network;
  }

  public addKeyFrame(frame: number, pin: PinNode, state: boolean) {
    const keyframe = this.keyframes[frame] = this.keyframes[frame] ?? [];
    keyframe.push({ pin, state });
  }

  public run(length?: number, onPostStep?: (frame: number) => void) {
    this.network.reset();
    this.history.splice(0, this.history.length);
    const pins = this.network.getPins();
    for (let frame = 0; frame < (length ?? this.keyframes.length); frame++) {
      const keyframe = this.keyframes[frame];
      if (keyframe) {
        for (const action of keyframe) {
          action.pin.active = action.state;
        }
      }
      this.network.step();
      this.history.push({
        frame,
        states: pins.map<PinState>(p => ({ pin: p, state: p.state })),
      });
      onPostStep?.(frame);
    }
  }

  public getHistory(): readonly HistoryFrame[] {
    return this.history;
  }

  public printHistory(highSymbol: string = '1', lowSymbol: string = '-', showLabels: boolean = true) {
    const pins = this.network.getPins();
    if (showLabels) {
      const pinNames = pins.map(p => p.label);
      console.log('\t' + pinNames.join('\t'));
    }
    for (const { frame, states } of this.history) {
      const pinStates = states.map(s => s.state);
      console.log(`${frame}\t` + pinStates.map(s => s ? highSymbol : lowSymbol).join('\t'));
    }
  }

}
