import { CircuitSimulation } from '@/simulation/CircuitSimulation';
import type {
  PinFilter,
  PinSort,
  PrintPinOrdering,
  PrintRecordingScopeOptions,
  PrintRecordingOptions,
  RecordingMap,
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
import { GateNode } from '@/simulation/GateNode';
import { Network, getNodeState } from '@/simulation/Network';
import type { GraphLayer } from '@/simulation/Network';
import { PathNode } from '@/simulation/PathNode';
import { PinNode, assignVCC } from '@/simulation/PinNode';
import { Sequence } from '@/simulation/Sequence';
import type { SequenceFrames } from '@/simulation/Sequence';
import type {
  DifferenceResult,
  VerificationDifference,
  VerificationResult,
} from '@/simulation/verification/IValidator';
import type {
  IValidator,
  SequencePair,
} from '@/simulation/verification/IValidator';
import { StrictValidator } from '@/simulation/verification/StrictValidator';
import { ToleranceValidator } from '@/simulation/verification/ToleranceValidator';
import { KOHCTPYKTOPValidator } from '@/simulation/verification/KOHCTPYKTOPValidator';

export type Point = [number, number];
export type NetworkNode = PinNode | PathNode | GateNode;

export {
  CircuitSimulation,
  type PinFilter,
  type PinSort,
  type PrintPinOrdering,
  type PrintRecordingOptions,
  type PrintRecordingScopeOptions,
  type RecordingMap,
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
