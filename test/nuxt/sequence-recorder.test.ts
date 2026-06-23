import { PathNode, Sequence } from '@/simulation';
import { NodeSequencer } from '@/simulation/NodeSequencer';
import { SequenceRecorder } from '@/simulation/SequenceRecorder';
import { assertEqual } from '@/test/utils/assert';
import { expect, test } from 'vitest';

test('test recording', () => {
  const sequencer = new NodeSequencer(20);
  const node = new PathNode();
  sequencer.add(
    new Sequence().addPulse(0, 1).addPulse(2, 1).addPulse(4, 1).addPulse(10, 5),
    node,
  );
  const recorder = new SequenceRecorder();
  recorder.add(node);
  for (let i = 0; i < 20; i++) {
    sequencer.step();
    recorder.record(i);
    assertEqual(recorder.getRecordingLength(), i + 1, 'recording length');
  }
  const recorded = recorder.get(node)!;
  expect(recorded).toBeDefined();
  assertEqual(recorder.getRecordingLength(), 20, 'recorder length');
  assertEqual(recorded.getLength(), 16, 'recording length');
  const expected = [
    true,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
  ];
  for (let i = 0; i < expected.length; i++) {
    const exp = expected[i];
    assertEqual(recorded.probe(i), exp, `frame ${i}`);
  }
});
