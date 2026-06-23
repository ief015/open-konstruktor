import { PathNode, PinNode, Sequence, type NetworkNode } from '@/simulation';

type SequencerMap = Map<Sequence, NetworkNode[]>;

/**
 * Handles updating node states as defined by assigned sequences.
 */
export class NodeSequencer {
  protected sequences: SequencerMap = new Map();
  protected frame: number = 0;
  protected length?: number;
  protected maxSequenceLength?: number = 0;

  public constructor(length?: number) {
    this.length = length;
  }

  public [Symbol.iterator](): Iterator<Sequence> {
    return this.sequences.keys();
  }

  public getSequences() {
    return this.sequences.keys();
  }

  public entries() {
    return this.sequences.entries();
  }

  public getCurrentFrame(): number {
    return this.frame;
  }

  /**
   * Get the length of the largest sequence.
   */
  public getMaxSequenceLength(): number {
    if (this.maxSequenceLength !== undefined) {
      return this.maxSequenceLength;
    }
    this.maxSequenceLength = this.sequences
      .keys()
      .reduce((max, seq) => Math.max(max, seq.getLength()), 0);
    return this.maxSequenceLength;
  }

  public invalidateMaxSequenceLength(): void {
    this.maxSequenceLength = undefined;
  }

  /**
   * Get the length of the sequencer.
   * Can be either manually set or automatically determined by the longest sequence.
   */
  public getLength(): number {
    if (this.length !== undefined) {
      return this.length;
    }
    return this.getMaxSequenceLength();
  }

  /**
   * Check if the sequencer is complete.
   * @returns `true` if the sequencer has reached the end
   */
  public isComplete(): boolean {
    return this.frame >= this.getLength();
  }

  /**
   * Set the length of the sequencer.
   * @param length Length of the sequencer. If undefined, the length will be determined by the longest sequence.
   */
  public setLength(length?: number): void {
    this.length = length;
  }

  /**
   * Add a node to a sequence.
   * @param sequence Sequence to add the node or nodes to.
   * @param node Node or nodes to add to the sequence.
   */
  public add(sequence: Sequence, node: NetworkNode | NetworkNode[]): void {
    if (!this.sequences.has(sequence)) {
      this.sequences.set(sequence, []);
    }
    if (Array.isArray(node)) {
      this.sequences.get(sequence)!.push(...node);
    } else {
      this.sequences.get(sequence)!.push(node);
    }
    this.invalidateMaxSequenceLength();
  }

  /**
   * Remove a sequence or nodes from the sequencer.
   * @param sequence Sequence to remove or remove from.
   * @param node Node or nodes to remove from the sequence. If not provided, the entire sequence is removed.
   */
  public remove(
    sequence: Sequence,
    node?: NetworkNode | NetworkNode[],
  ): boolean {
    this.invalidateMaxSequenceLength();
    if (node) {
      const nodes = this.sequences.get(sequence);
      if (!nodes) return false;
      let prevLen = nodes.length;
      const arr = Array.isArray(node) ? node : [node];
      nodes.splice(0, nodes.length, ...nodes.filter((n) => !arr.includes(n)));
      if (nodes.length === 0) {
        return this.sequences.delete(sequence);
      }
      return prevLen !== nodes.length;
    } else {
      return this.sequences.delete(sequence);
    }
  }

  /**
   * Remove all sequences from the sequencer.
   */
  public clear() {
    this.sequences.clear();
    this.invalidateMaxSequenceLength();
  }

  /**
   * Reset sequencer and nodes to initial state.
   */
  public reset() {
    this.frame = 0;
    for (const [sequence, nodes] of this.sequences) {
      for (const node of nodes) {
        if (node instanceof PinNode) {
          node.active = sequence.getFront();
        } else if (node instanceof PathNode) {
          node.state = sequence.getFront();
        }
      }
    }
  }

  /**
   * Step the sequencer to the next frame.
   * @returns `true` if the sequencer has reached the end, `false` otherwise.
   */
  public step(): boolean {
    if (this.isComplete()) return true;
    for (const [sequence, nodes] of this.sequences) {
      const state = sequence.getFrames()[this.frame];
      if (state === undefined) continue;
      for (const node of nodes) {
        if (node instanceof PinNode) {
          node.active = state;
        } else if (node instanceof PathNode) {
          node.state = state;
        }
      }
    }
    this.frame++;
    return false;
  }

  /**
   * Move the sequencer to a specific frame.
   */
  public moveTo(frame: number) {
    this.frame = Math.max(0, Math.min(frame, this.getLength() - 1));
    for (const [sequence, nodes] of this.sequences) {
      for (const node of nodes) {
        if (node instanceof PinNode) {
          node.active = sequence.probe(this.frame);
        } else if (node instanceof PathNode) {
          node.state = sequence.probe(this.frame);
        }
      }
    }
  }
}
