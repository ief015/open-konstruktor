export type SequenceFrames = boolean[];

/**
 * A sequence is a record of frames with signal edges to represent a digital signal.
 */
export class Sequence implements Iterable<boolean> {
  protected frames: SequenceFrames = [];
  protected frameIndexCache: Readonly<Array<keyof SequenceFrames>> | null =
    null;

  public [Symbol.iterator](): Iterator<boolean> {
    let frame = 0;
    let state = false;
    return {
      next: () => {
        if (frame >= this.frames.length) {
          return { done: true, value: state };
        }
        const nextState = this.frames[frame];
        if (nextState !== undefined) {
          state = nextState;
        }
        frame++;
        return { done: false, value: state };
      },
    };
  }

  protected buildFrameIndexCache() {
    this.frameIndexCache = Object.freeze(
      Object.keys(this.frames) as Array<keyof SequenceFrames>,
    );
    return this.frameIndexCache;
  }

  protected invalidateFrameIndexCache() {
    this.frameIndexCache = null;
  }

  public getFrameIndices(): Readonly<Array<keyof SequenceFrames>> {
    return this.frameIndexCache ?? this.buildFrameIndexCache();
  }

  public slice(start: number = 0, end?: number): Sequence {
    const sequence = new Sequence();
    sequence.frames = this.frames.slice(start, end);
    sequence.frames[0] = this.probe(start);
    return sequence;
  }

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

  /**
   * Get the closest frame index before or at the given index that has a state change.
   * @param fromIdx
   */
  protected getClosestFrameIndex(fromIdx: number): number {
    fromIdx = Math.max(0, Math.min(fromIdx, this.frames.length - 1));
    if (this.frames[fromIdx] !== undefined) {
      return fromIdx;
    }
    const indices = this.getFrameIndices();
    let left = 0;
    let right = indices.length - 1;
    let idx: keyof SequenceFrames | undefined = undefined;
    while (left <= right) {
      const mid = (left + right) >> 1;
      // for performance, just assert as number. comparison should still work as expected
      if ((indices[mid] as number) <= fromIdx) {
        idx = indices[mid];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return idx !== undefined ? Number(idx) : 0;
  }

  /**
   * Search for the state of the sequence at a given frame.
   */
  public probe(frame: number): boolean {
    const idx = this.getClosestFrameIndex(frame);
    return this.frames[idx] ?? false;
  }

  public setFrame(frame: number, state: boolean): Sequence {
    this.frames[frame] = state;
    this.invalidateFrameIndexCache();
    return this;
  }

  public applyFrames(frames: SequenceFrames): Sequence {
    Object.assign(this.frames, frames);
    this.invalidateFrameIndexCache();
    return this;
  }

  public addPulseRange(start: number, end: number): Sequence {
    this.frames[start] = true;
    this.frames[end] = false;
    this.invalidateFrameIndexCache();
    return this;
  }

  public addPulse(frame: number, duration: number): Sequence {
    this.addPulseRange(frame, frame + duration);
    return this;
  }

  public addTogglePoints(...frames: number[]): Sequence {
    let state = true;
    for (const frame of frames) {
      this.frames[frame] = state;
      state = !state;
    }
    this.invalidateFrameIndexCache();
    return this;
  }

  public repeatTogglePoints(
    start: number,
    repeat: number,
    padEnd: number,
    frameOffsets: number[],
  ): Sequence {
    let state = true;
    for (let l = 0; l < repeat; l++) {
      for (const offset of frameOffsets) {
        this.frames[start + offset] = state;
        state = !state;
      }
      start += frameOffsets[frameOffsets.length - 1] + padEnd;
    }
    this.invalidateFrameIndexCache();
    return this;
  }

  public addOscillation(
    frame: number,
    numPulses: number,
    highDuration: number,
    lowDuration: number,
  ): Sequence {
    for (let i = 0; i < numPulses; i++) {
      this.addPulse(frame + i * (highDuration + lowDuration), highDuration);
    }
    return this;
  }

  public toString(len: number = this.frames.length): string {
    let str = '';
    let state = false;
    for (let i = 0; i < len; i++) {
      const frame = this.frames[i];
      if (frame !== undefined) {
        state = frame;
      }
      str += state ? '1' : '0';
    }
    return str;
  }

  /**
   * Builds a sequence from an array of booleans.
   * If a sparse array is provided, then gaps will be assumed to be previous state.
   */
  public static from(states: boolean[]): Sequence {
    const seq = new Sequence();
    let last: boolean | undefined = undefined;
    for (const frame in states) {
      const state = states[frame];
      if (state !== last) {
        seq.frames[frame] = state;
        last = state;
      }
    }
    return seq;
  }
}
