import { CircuitSimulation } from '@/simulation/CircuitSimulation';
import type {
  PinFilter,
  PinSort,
  PrintPinOrdering,
  PrintRecordingScopeOptions,
  PrintRecordingOptions,
  SequenceMap,
  ProbeInfo,
} from '@/simulation/CircuitSimulation';
import { FieldGraph } from '@/simulation/FieldGraph';
import type {
  Direction,
  DrawType,
  EraseType,
  QueryMetalResult,
  QueryResult,
  QuerySiliconResult,
  SiliconType,
} from '@/simulation/FieldGraph';
import { Network, getNodeState, type GraphLayer } from '@/simulation/Network';
import { GateNode } from '@/simulation/GateNode';
import { PathNode } from '@/simulation/PathNode';
import { PinNode, assignVCC } from '@/simulation/PinNode';
import { Sequence, type SequenceFrames } from '@/simulation/Sequence';
import type {
  DifferenceResult,
  VerificationDifference,
  VerificationResult,
  IValidator,
  SequencePair,
} from '@/simulation/verification/IValidator';
import { StrictValidator } from '@/simulation/verification/StrictValidator';
import { ToleranceValidator } from '@/simulation/verification/ToleranceValidator';
import { KOHCTPYKTOPValidator } from '@/simulation/verification/KOHCTPYKTOPValidator';
import { NodeSequencer } from '@/simulation/NodeSequencer';
import {
  SequenceRecorder,
  type Recordable,
  type RecordableFn,
} from '@/simulation/SequenceRecorder';

export type Point = [number, number];
export type NetworkNode = PinNode | PathNode | GateNode;

export {
  CircuitSimulation,
  NodeSequencer,
  SequenceRecorder,
  type Recordable,
  type RecordableFn,
  type PinFilter,
  type PinSort,
  type PrintPinOrdering,
  type PrintRecordingOptions,
  type PrintRecordingScopeOptions,
  type SequenceMap,
  type ProbeInfo,
};

export {
  FieldGraph,
  type Direction,
  type DrawType,
  type EraseType,
  type QueryMetalResult,
  type QueryResult,
  type QuerySiliconResult,
  type SiliconType,
};

export { Sequence, type SequenceFrames };

export {
  type IValidator,
  type DifferenceResult,
  type VerificationDifference,
  type VerificationResult,
  type SequencePair,
  StrictValidator,
  ToleranceValidator,
  KOHCTPYKTOPValidator,
};

export {
  Network,
  GateNode,
  PinNode,
  PathNode,
  assignVCC,
  getNodeState,
  type GraphLayer,
};
