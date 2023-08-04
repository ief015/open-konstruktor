import Network from "./Network";
import PinNode from "./PinNode";

export type KeyframeAction = {
  pin: PinNode;
  state: boolean;
};

export type Keyframe = KeyframeAction[];

export default class Timeline {

  private network: Network;
  private keyframes: Keyframe[] = [];

  constructor(network: Network) {
    this.network = network;
  }

  public addKeyframe(frame: number, pin: PinNode, state: boolean) {
    const keyframe = this.keyframes[frame] = this.keyframes[frame] ?? [];
    keyframe.push({ pin, state });
  }

  public play(length?: number, onPostStep?: (frame: number) => void) {
    this.network.reset();
    for (let frame = 0; frame < (length ?? this.keyframes.length); frame++) {
      const keyframe = this.keyframes[frame];
      if (keyframe) {
        for (const action of keyframe) {
          action.pin.active = action.state;
        }
      }
      this.network.step();
      onPostStep?.(frame);
    }
  }

}
