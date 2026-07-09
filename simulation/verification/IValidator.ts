import { Sequence } from '@/simulation';

export interface DifferenceResult {
  /**
   * Number of differences between the two sequences.
   */
  differences: number;
  /**
   * Ratio of differences to the total number of frames.
   * A ratio of 1 means the sequences are identical, while a ratio of 0 means they are completely different.
   */
  ratio: number;
}

export interface SequencePair {
  /**
   * The expected reference sequence.
   */
  expected: Sequence;
  /**
   * The sequence verified against the expected sequence.
   */
  actual: Sequence;
}

export type VerificationDifference = DifferenceResult & SequencePair;

export interface VerificationResult {
  /**
   * Verification grade as a percentage.
   */
  gradePercent: number;
  /**
   * Whether the verification passed or failed.
   */
  passed: boolean;
  /**
   * Difference results for sequence pairs.
   */
  differences?: VerificationDifference[];
}

/**
 * Verifies sequences against expected reference sequences and provides a grade based on the differences.
 */
export abstract class IValidator {
  /**
   * Check if two sequences are equal at a specific frame.
   * @param expected Expected reference sequence
   * @param actual Sequence verified against the expected reference sequence
   * @param frame Frame number
   */
  public abstract isFrameEqual(
    expected: Sequence,
    actual: Sequence,
    frame: number,
  ): boolean;

  /**
   * Get the differences between two sequences.
   * @param expected Expected reference sequence
   * @param actual Sequence verified against the expected reference sequence
   * @param length Verification length
   */
  public abstract getDifference(
    expected: Sequence,
    actual: Sequence,
    length?: number,
  ): DifferenceResult;

  /**
   * Verify and grade sequences against expected sequences.
   * @param sequences Sequences to verify
   * @param length Verification length
   */
  public abstract verify(
    sequences: SequencePair[],
    length?: number,
  ): VerificationResult;
}
