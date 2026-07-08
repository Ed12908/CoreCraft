import type { Edge, Node } from "@xyflow/react";

export type Bit = 0 | 1;

export const bitValues = [0, 1] as const;

export function toBit(value: unknown): Bit {
  return value === 1 || value === true ? 1 : 0;
}

export type GateKind = "not" | "and" | "or" | "xor";
export type IoKind = "input" | "output";
export type ComponentKind = IoKind | GateKind;

export type PortDirection = "in" | "out";

export type PortSpec = {
  id: string;
  label: string;
  direction: PortDirection;
};

export type ComponentDefinition = {
  kind: ComponentKind;
  title: string;
  shortTitle: string;
  description: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  evaluate?: (inputs: Record<string, Bit>) => Record<string, Bit>;
};

export type CircuitNodeData = {
  kind: ComponentKind;
  label: string;
  fixed?: boolean;
  value?: Bit;
} & Record<string, unknown>;

export type CircuitNode = Node<CircuitNodeData, "component">;
export type CircuitEdge = Edge<Record<string, unknown>>;

export type LogicCase = {
  name: string;
  inputs: Record<string, Bit>;
  outputs: Record<string, Bit>;
};

export type LevelGiven = {
  id: string;
  kind: IoKind;
  label: string;
  position: { x: number; y: number };
};

export type Level = {
  id: string;
  title: string;
  chapter: string;
  prompt: string;
  allowedComponents: GateKind[];
  givens: LevelGiven[];
  tests: LogicCase[];
  unlocks: GateKind[];
  hints: string[];
  successMessage: string;
};

export type SavedCircuit = {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  updatedAt: string;
};
