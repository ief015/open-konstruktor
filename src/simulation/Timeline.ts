import Network from "./Network";
import PinNode from "./PinNode";

export type KeyframeAction = {
  pin: PinNode;
  state: boolean;
};

export type Keyframe = KeyframeAction[];

export default class Timeline {

  private keyframes: Keyframe[] = [];

  public addKeyframe(frame: number, pin: PinNode, state: boolean) {
    const keyframe = this.keyframes[frame] = this.keyframes[frame] ?? [];
    keyframe.push({ pin, state });
  }

  public play(network: Network, onPostStep?: (frame: number) => void) {
    network.reset();
    for (let frame = 0; frame < this.keyframes.length; frame++) {
      const keyframe = this.keyframes[frame];
      if (keyframe) {
        for (const action of keyframe) {
          action.pin.active = action.state;
        }
      }
      network.step();
      onPostStep?.(frame);
    }
  }

}
