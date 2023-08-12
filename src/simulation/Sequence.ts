export type SequenceFrames = boolean[];

export interface DifferenceOptions {
  offsetThis?: number;
  offsetOther?: number;
  length?: number;
}

export default class Sequence {

  private frames: SequenceFrames = [];

  public getFrames(): Readonly<SequenceFrames> {
    return this.frames;
  }

  /**
   * The initial state of the sequence.
   */
  public getFront(): boolean {
    return this.frames[0] ?? false;
  }

  /**
   * The last state in the sequence.
   */
  public getBack(): boolean {
    return this.frames[this.frames.length - 1] ?? false;
  }

  /**
   * The number of frames in the sequence.
   */
  public getLength(): number {
    return this.frames.length;
  }

  public setFrame(frame: number, state: boolean) {
    this.frames[frame] = state;
  }

  public addPulseRange(start: number, end: number) {
    this.setFrame(start, true);
    this.setFrame(end, false);
  }

  public addPulse(frame: number, duration: number) {
    return this.addPulseRange(frame, frame + duration);
  }

  public addTogglePoints(...frames: number[]) {
    let state = true;
    for (const frame of frames) {
      this.setFrame(frame, state);
      state = !state;
    }
  }

  public addOscillation(frame: number, numPulses: number, highDuration: number, lowDuration: number) {
    for (let i = 0; i < numPulses; i++) {
      this.addPulse(frame + i * (highDuration + lowDuration), highDuration);
    }
  }

  public getDifference(other: Sequence, options: DifferenceOptions = {}): number {
    const {
      offsetThis = 0,
      offsetOther = 0,
      length = Math.max(this.frames.length, other.frames.length),
    } = options;
    let diff = 0;
    // TODO
    return diff;
  }

}