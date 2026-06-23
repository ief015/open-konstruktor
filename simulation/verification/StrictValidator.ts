import type {
  Sequence,
  DifferenceResult,
  VerificationDifference,
  VerificationResult,
  IValidator,
  SequencePair,
} from '@/simulation';

/**
 * A simple, strict validator that requires exact matches between expected and actual sequences.
 */
export class StrictValidator implements IValidator {
  public passingGradePercent: number;

  public constructor(passingGradePercent: number = 100) {
    this.passingGradePercent = passingGradePercent;
  }

  public isFrameEqual(
    expected: Sequence,
    actual: Sequence,
    frame: number,
  ): boolean {
    return expected.probe(frame) === actual.probe(frame);
  }

  public getDifference(
    expected: Sequence,
    actual: Sequence,
    length?: number,
  ): DifferenceResult {
    const len = length ?? Math.max(expected.getLength(), actual.getLength());
    let differences = 0;
    for (let i = 0; i < len; i++) {
      if (!this.isFrameEqual(expected, actual, i)) {
        differences++;
      }
    }
    const ratio = len === 0 ? 1 : 1 - differences / len;
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
