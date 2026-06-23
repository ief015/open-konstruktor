import { PathNode, Sequence, NodeSequencer } from '@/simulation';
import { assertEqual } from '@/test/utils/assert';
import { test } from 'vitest';

test('test sequencer', () => {
  const sequencer = new NodeSequencer(20);
  const node = new PathNode();
  const seq = new Sequence()
    .addPulse(0, 1)
    .addPulse(2, 1)
    .addPulse(4, 1)
    .addPulse(10, 5);
  sequencer.add(seq, node);
  assertEqual(sequencer.getLength(), 20, 'length');
  assertEqual(sequencer.getMaxSequenceLength(), 16, 'max sequence length');
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
  for (const exp of expected) {
    assertEqual(sequencer.isComplete(), false, 'not yet completed');
    sequencer.step();
    assertEqual(node.state, exp, `frame ${sequencer.getCurrentFrame()}`);
  }
  assertEqual(sequencer.isComplete(), true, 'finished');
  assertEqual(sequencer.getCurrentFrame(), 20, 'current frame');
});
