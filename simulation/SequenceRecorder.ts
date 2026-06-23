import { getNodeState, Sequence, type NetworkNode } from '@/simulation';

type RecordingMap = Map<NetworkNode, Sequence>;

/**
 * Handles recording node states to sequences.
 */
export class SequenceRecorder {
  protected recordings: RecordingMap = new Map();

  public [Symbol.iterator](): Iterator<Sequence> {
    return this.recordings.values();
  }

  /**
   * Get the recording for a node.
   */
  public getRecording(node: NetworkNode): Sequence | undefined {
    return this.recordings.get(node);
  }

  /**
   * Get all recordings.
   */
  public getRecordings() {
    return this.recordings.entries();
  }

  /**
   * Add a node to the recorder.
   * @param node
   */
  public add(node: NetworkNode): void {
    if (!this.recordings.has(node)) {
      this.recordings.set(node, new Sequence());
    }
  }

  /**
   * Remove a node from the recorder.
   * @param node
   */
  public remove(node: NetworkNode): void {
    this.recordings.delete(node);
  }

  /**
   * Remove all nodes from the recorder.
   */
  public clear(): void {
    this.recordings.clear();
  }

  /**
   * Clear recordings.
   */
  public reset(): void {
    for (const [node, sequence] of this.recordings) {
      sequence.clear();
    }
  }

  /**
   * Record nodes to sequences.
   * @param frame Record to a specific frame.
   */
  public record(frame?: number): void {
    for (const [node, sequence] of this.recordings) {
      const at = frame ?? sequence.getLength();
      const state = getNodeState(node);
      if (sequence.probe(at) !== state) {
        sequence.setFrame(at, state);
      }
    }
  }
}
