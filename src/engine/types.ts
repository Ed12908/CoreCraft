import type { Edge, Node } from "@xyflow/react";

export type Bit = 0 | 1;
export type SignalValue = number;

export const bitValues = [0, 1] as const;

export function toBit(value: unknown): Bit {
  return value === 1 || value === true ? 1 : 0;
}

export type GateKind =
  | "const0"
  | "const1"
  | "not"
  | "and"
  | "or"
  | "xor"
  | "halfAdder"
  | "fullAdder"
  | "adder2"
  | "adder4"
  | "bus4"
  | "splitter"
  | "joiner"
  | "comparator"
  | "incrementer"
  | "subtractor";
export type IoKind = "input" | "output";
export type ComponentKind = IoKind | GateKind;

export type PortDirection = "in" | "out";

export type PortSpec = {
  id: string;
  label: string;
  direction: PortDirection;
  width: number;
};

export type ComponentDefinition = {
  kind: ComponentKind;
  title: string;
  shortTitle: string;
  description: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  evaluate?: (inputs: Record<string, SignalValue>) => Record<string, SignalValue>;
};

export type CircuitNodeData = {
  kind: ComponentKind;
  label: string;
  fixed?: boolean;
  value?: SignalValue;
  width?: number;
} & Record<string, unknown>;

export type CircuitNode = Node<CircuitNodeData, "component">;
export type CircuitEdge = Edge<Record<string, unknown>>;

export type LogicCase = {
  name: string;
  inputs: Record<string, SignalValue>;
  outputs: Record<string, SignalValue>;
};

export type LevelGiven = {
  id: string;
  kind: IoKind;
  label: string;
  width?: number;
  position: { x: number; y: number };
};

export type Level = {
  id: string;
  title: string;
  chapter: string;
  prompt: string;
  allowedComponents: GateKind[];
  minimumComponents: number;
  givens: LevelGiven[];
  tests: LogicCase[];
  unlocks: GateKind[];
  hints: string[];
  successMessage: string;
};

export type LevelScore = {
  points: number;
  maxPoints: number;
  usedComponents: number;
  minimumComponents: number;
  minimal: boolean;
  awardedAt: string;
};

export type SavedCircuit = {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  updatedAt: string;
};
