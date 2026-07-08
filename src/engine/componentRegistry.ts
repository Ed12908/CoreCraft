import type { Bit, ComponentDefinition, ComponentKind, GateKind } from "./types";

const input = (id: string, label: string) => ({ id, label, direction: "in" as const });
const output = (id: string, label: string) => ({ id, label, direction: "out" as const });

const bool = (value: boolean): Bit => (value ? 1 : 0);

export const componentDefinitions: Record<ComponentKind, ComponentDefinition> = {
  input: {
    kind: "input",
    title: "Switch",
    shortTitle: "SW",
    description: "A named 1-bit signal source. During tests, level cases drive this value.",
    inputs: [],
    outputs: [output("out", "Out")],
  },
  output: {
    kind: "output",
    title: "Lamp",
    shortTitle: "LAMP",
    description: "A named 1-bit signal target. Level tests read this value.",
    inputs: [input("in", "In")],
    outputs: [],
  },
  not: {
    kind: "not",
    title: "NOT Gate",
    shortTitle: "NOT",
    description: "Outputs 1 when the input is 0, and 0 when the input is 1.",
    inputs: [input("in", "In")],
    outputs: [output("out", "Out")],
    evaluate: ({ in: value }) => ({ out: value === 1 ? 0 : 1 }),
  },
  and: {
    kind: "and",
    title: "AND Gate",
    shortTitle: "AND",
    description: "Outputs 1 only when both inputs are 1.",
    inputs: [input("a", "A"), input("b", "B")],
    outputs: [output("out", "Out")],
    evaluate: ({ a, b }) => ({ out: bool(a === 1 && b === 1) }),
  },
  or: {
    kind: "or",
    title: "OR Gate",
    shortTitle: "OR",
    description: "Outputs 1 when at least one input is 1.",
    inputs: [input("a", "A"), input("b", "B")],
    outputs: [output("out", "Out")],
    evaluate: ({ a, b }) => ({ out: bool(a === 1 || b === 1) }),
  },
  xor: {
    kind: "xor",
    title: "XOR Gate",
    shortTitle: "XOR",
    description: "Outputs 1 when exactly one input is 1.",
    inputs: [input("a", "A"), input("b", "B")],
    outputs: [output("out", "Out")],
    evaluate: ({ a, b }) => ({ out: bool(a !== b) }),
  },
};

export const gateDefinitions: Record<GateKind, ComponentDefinition> = {
  not: componentDefinitions.not,
  and: componentDefinitions.and,
  or: componentDefinitions.or,
  xor: componentDefinitions.xor,
};

export function getDefinition(kind: ComponentKind): ComponentDefinition {
  return componentDefinitions[kind];
}

export function handleId(direction: "in" | "out", portId: string): string {
  return `${direction}:${portId}`;
}

export function parseHandleId(handle: string | null | undefined): { direction: "in" | "out"; portId: string } | null {
  if (!handle) return null;
  const [direction, portId] = handle.split(":");
  if ((direction !== "in" && direction !== "out") || !portId) return null;
  return { direction, portId };
}
