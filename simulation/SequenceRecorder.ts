import { getNodeState, Sequence, type NetworkNode } from '@/simulation';

export type RecordableFn = (frame: number) => boolean | null;
export type Recordable = NetworkNode | RecordableFn;
type RecordingMap = Map<Recordable, Sequence>;

/**
 * Handles recording node states to sequences.
 */
export class SequenceRecorder {
  protected recordings: RecordingMap = new Map();
  protected recordingLength?: number = 0;

  public [Symbol.iterator](): Iterator<Sequence> {
    return this.recordings.values();
  }

  /**
   * Get the recording for a node.
   */
  public get(node: Recordable): Sequence | undefined {
    return this.recordings.get(node);
  }

  /**
   * Get all recordings.
   */
  public entries() {
    return this.recordings.entries();
  }

  /**
   * Get all recording sequences.
   */
  public values() {
    return this.recordings.values();
  }

  /**
   * Get the length of the recording.
   */
  public getRecordingLength(): number {
    return this.recordingLength ?? 0;
  }

  /**
   * Add a node to the recorder.
   * @param node
   */
  public add(node: Recordable) {
    if (!this.recordings.has(node)) {
      this.recordings.set(node, new Sequence());
    }
  }

  /**
   * Remove a node from the recorder.
   * @param node
   */
  public remove(node: Recordable) {
    return this.recordings.delete(node);
  }

  /**
   * Remove all nodes from the recorder.
   */
  public clear() {
    this.recordings.clear();
    this.recordingLength = 0;
  }

  /**
   * Clear recordings.
   */
  public reset() {
    for (const [node, sequence] of this.recordings) {
      sequence.clear();
    }
    this.recordingLength = 0;
  }

  protected getRecordableValue(
    node: Recordable,
    frame: number,
  ): boolean | null {
    if (typeof node === 'function') {
      return node(frame);
    }
    return getNodeState(node);
  }

  /**
   * Record nodes to sequences.
   * @param frame Record to a specific frame.
   */
  public record(frame?: number) {
    for (const [node, sequence] of this.recordings) {
      const len = sequence.getLength();
      const at = frame ?? len;
      const state = this.getRecordableValue(node, at);
      if (state === null) continue;
      if (at < len || sequence.getBack() !== state) {
        sequence.setFrame(at, state);
      }
    }
    this.recordingLength = Math.max(
      this.recordingLength ?? 0,
      (frame ?? 0) + 1,
    );
  }
}
