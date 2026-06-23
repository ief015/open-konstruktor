import type {
  IValidator,
  Sequence,
  DifferenceResult,
  VerificationDifference,
  VerificationResult,
  SequencePair,
} from '@/simulation';

/**
 * A forgiving validator that allows a window of tolerance in frame differences between expected and actual sequences.
 */
export class ToleranceValidator implements IValidator {
  public passingGradePercent: number;
  public tolerance: number;

  public constructor(passingGradePercent: number = 100, tolerance: number = 2) {
    this.passingGradePercent = passingGradePercent;
    this.tolerance = tolerance;
  }

  protected isFrameEqualOrSkip(
    expected: Sequence,
    actual: Sequence,
    frame: number,
  ): boolean | null {
    const frameState = expected.probe(frame);
    const tolerance = this.tolerance;
    for (let o = -tolerance; o <= tolerance; o++) {
      if (o === 0) continue;
      if (expected.probe(frame + o) !== frameState) {
        return null; // Skip this frame because the expected sequence is changing within the tolerance window.
      }
    }
    return actual.probe(frame) === frameState;
  }

  public isFrameEqual(
    expected: Sequence,
    actual: Sequence,
    frame: number,
  ): boolean {
    // If the frame is skipped, consider it equal.
    return this.isFrameEqualOrSkip(expected, actual, frame) ?? true;
  }

  public getDifference(
    expected: Sequence,
    actual: Sequence,
    length?: number,
  ): DifferenceResult {
    const len = length ?? Math.max(expected.getLength(), actual.getLength());
    let differences = 0;
    let skippedFrames = 0;
    const tolerance = this.tolerance;
    const max = len - tolerance;
    for (let i = tolerance; i < max; i++) {
      const isEqualOrSkip = this.isFrameEqualOrSkip(expected, actual, i);
      if (isEqualOrSkip === null) {
        skippedFrames++;
      } else if (!isEqualOrSkip) {
        differences++;
      }
    }
    const total = len - skippedFrames - 2 * tolerance;
    const ratio = total === 0 ? 1 : 1 - differences / total;
    return { differences, ratio };
  }

  public verify(
    sequences: SequencePair[],
    length?: number,
  ): VerificationResult {
    let sumRatio = 0;
    const differences: VerificationDifference[] = [];
    for (const { expected, actual } of sequences) {
      const diff = this.getDifference(expected, actual, length);
      sumRatio += diff.ratio;
      differences.push({
        expected,
        actual,
        ...diff,
      });
    }
    const gradePercent = (sumRatio / differences.length) * 100 || 0;
    const passed = gradePercent >= this.passingGradePercent;
    return {
      passed,
      gradePercent,
      differences,
    };
  }
}
