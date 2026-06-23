import {
  ToleranceValidator,
  type SequencePair,
  type VerificationDifference,
  type VerificationResult,
} from '@/simulation';

/**
 * Original verification method used by KOHCTPYKTOP.
 */
export class KOHCTPYKTOPValidator extends ToleranceValidator {
  public constructor(passingGradePercent: number = 97, tolerance: number = 2) {
    super(passingGradePercent, tolerance);
  }

  public override verify(
    sequences: SequencePair[],
    length?: number,
  ): VerificationResult {
    let sumRatio = 0;
    const differences: VerificationDifference[] = [];
    for (const { expected, actual } of sequences) {
      const diff = this.getDifference(expected, actual, length);
      sumRatio += Math.trunc(diff.ratio * 100); // Inaccurate, but how kohctpyktop does it.
      differences.push({
        expected,
        actual,
        ...diff,
      });
    }
    const gradePercent = Math.trunc(sumRatio / differences.length) || 0;
    const passed = gradePercent >= this.passingGradePercent;
    return {
      passed,
      gradePercent,
      differences,
    };
  }
}
