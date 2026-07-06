import { kohctpyktop } from '@/circuits/kohctpyktop';
import { FieldGraph, KOHCTPYKTOPValidator, Network } from '@/simulation';
import { assertEqual } from '@/test/utils/assert';
import { test } from 'vitest';

test('findFrameVerificationErrors - there should be no errors', () => {
  const saveString =
    'eNrtmWESgiAUhPGtfzxDV/B/Z+n+F2myBpN4KBgKsjoMjZ8bOcq2T/qxvw2Pbrh3vUnZKxXK6h4csfucoPWrQqP26jW2LZQ0odkulDShobB0oaQJDYUUXlUoaUJzQeHlcs4U50TfJgrA2/ZTeX2CLJsdd5XCHvn5zeJFMxVS0gIp6qMIU9lO39/k0MkEYIfJ7UjqPdpklec/PI5XcqKRkpIeSiuwSlJSUtLmrXJO4NAjur8AnyM6bzEpaRWlPeIpFvO87VQZLLERLsDLp4J4KmiUqpOFtATqt6x8lKnyO1U6W2SqrOD/PeX9arM5GUyGJVOwAA/LT1zjFq5xk7JMLprGrHGHKbTXa27tlmeN+y9W6W/76a5HC7RKUtLTKfLWFH6rPNyRng5AyHA=';
  const field = FieldGraph.from(saveString, 'circuit');
  const net = Network.from(field);
  const sim = findLoaderById(
    kohctpyktop,
    '01 KT411I QUAD INVERTER GATE',
  )!.setup(net);
  const validator = new KOHCTPYKTOPValidator();
  sim.setValidator(validator);
  sim.run(280, (frame) => {
    const errors = sim.findFrameVerificationErrors(frame);
    assertEqual(errors.length, 0, 'errors.length');
  });
  const verification = sim.verify();
  const grade = verification.gradePercent;
  const designScore = field.getDesignScore();
  assertEqual(grade, 100, 'grade');
  assertEqual(designScore, 202, 'design score');
});
