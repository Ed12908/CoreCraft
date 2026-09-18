import type {
  Bit,
  CircuitNode,
  ComponentDefinition,
  ComponentKind,
  GateKind,
  PortDirection,
  SignalValue,
} from "./types";

const input = (id: string, label: string, width = 1) => ({ id, label, width, direction: "in" as const });
const output = (id: string, label: string, width = 1) => ({ id, label, width, direction: "out" as const });

const bool = (value: boolean): Bit => (value ? 1 : 0);
const bit = (value: SignalValue | undefined): Bit => (value === 1 ? 1 : 0);
const mask = (width: number): number => 2 ** width - 1;
const busBit = (value: SignalValue | undefined, index: number): Bit => (((value ?? 0) >> index) & 1 ? 1 : 0);
const busFromBits = (...bits: SignalValue[]): SignalValue =>
  bits.reduce((value, nextBit, index) => value | (bit(nextBit) << index), 0);

const bitAdder = (a: SignalValue, b: SignalValue, carryIn: SignalValue) => {
  const total = bit(a) + bit(b) + bit(carryIn);
  return {
    sum: (total & 1) as Bit,
    carry: bool(total >= 2),
  };
};

export const componentDefinitions: Record<ComponentKind, ComponentDefinition> = {
  input: {
    kind: "input",
    title: "Switch",
    shortTitle: "SW",
    description: "A named signal source. During tests, level cases drive this value.",
    inputs: [],
    outputs: [output("out", "Out")],
  },
  output: {
    kind: "output",
    title: "Lamp",
    shortTitle: "LAMP",
    description: "A named signal target. Level tests read this value.",
    inputs: [input("in", "In")],
    outputs: [],
  },
  const0: {
    kind: "const0",
    title: "Constant 0",
    shortTitle: "0",
    description: "A fixed low signal for carry and unused adder inputs.",
    inputs: [],
    outputs: [output("out", "Out")],
    evaluate: () => ({ out: 0 }),
  },
  const1: {
    kind: "const1",
    title: "Constant 1",
    shortTitle: "1",
    description: "A fixed high signal for increments and two's-complement carry-in.",
    inputs: [],
    outputs: [output("out", "Out")],
    evaluate: () => ({ out: 1 }),
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
  halfAdder: {
    kind: "halfAdder",
    title: "Half Adder",
    shortTitle: "HA",
    description: "Adds two 1-bit inputs and emits SUM plus CARRY.",
    inputs: [input("a", "A"), input("b", "B")],
    outputs: [output("sum", "SUM"), output("carry", "CARRY")],
    evaluate: ({ a, b }) => ({
      sum: bit(a) === bit(b) ? 0 : 1,
      carry: bool(a === 1 && b === 1),
    }),
  },
  fullAdder: {
    kind: "fullAdder",
    title: "Full Adder",
    shortTitle: "FA",
    description: "Adds A, B, and carry-in to produce SUM and carry-out.",
    inputs: [input("a", "A"), input("b", "B"), input("cin", "CIN")],
    outputs: [output("sum", "SUM"), output("cout", "COUT")],
    evaluate: ({ a, b, cin }) => {
      const total = bit(a) + bit(b) + bit(cin);
      return { sum: total & 1, cout: bool(total >= 2) };
    },
  },
  adder2: {
    kind: "adder2",
    title: "2-Bit Adder",
    shortTitle: "ADD2",
    description: "Adds two 2-bit numbers using bit ports and a carry-in.",
    inputs: [input("a0", "A0"), input("a1", "A1"), input("b0", "B0"), input("b1", "B1"), input("cin", "CIN")],
    outputs: [output("s0", "S0"), output("s1", "S1"), output("cout", "COUT")],
    evaluate: ({ a0, a1, b0, b1, cin }) => {
      const low = bitAdder(a0, b0, cin);
      const high = bitAdder(a1, b1, low.carry);
      return { s0: low.sum, s1: high.sum, cout: high.carry };
    },
  },
  adder4: {
    kind: "adder4",
    title: "4-Bit Adder",
    shortTitle: "ADD4",
    description: "Adds two 4-bit numbers using separate bit ports.",
    inputs: [
      input("a0", "A0"),
      input("a1", "A1"),
      input("a2", "A2"),
      input("a3", "A3"),
      input("b0", "B0"),
      input("b1", "B1"),
      input("b2", "B2"),
      input("b3", "B3"),
      input("cin", "CIN"),
    ],
    outputs: [output("s0", "S0"), output("s1", "S1"), output("s2", "S2"), output("s3", "S3"), output("cout", "COUT")],
    evaluate: ({ a0, a1, a2, a3, b0, b1, b2, b3, cin }) => {
      const c0 = bitAdder(a0, b0, cin);
      const c1 = bitAdder(a1, b1, c0.carry);
      const c2 = bitAdder(a2, b2, c1.carry);
      const c3 = bitAdder(a3, b3, c2.carry);
      return { s0: c0.sum, s1: c1.sum, s2: c2.sum, s3: c3.sum, cout: c3.carry };
    },
  },
  bus4: {
    kind: "bus4",
    title: "4-Bit Bus",
    shortTitle: "BUS4",
    description: "Carries a 4-bit value as one wire.",
    inputs: [input("in", "In", 4)],
    outputs: [output("out", "Out", 4)],
    evaluate: ({ in: value }) => ({ out: (value ?? 0) & mask(4) }),
  },
  splitter: {
    kind: "splitter",
    title: "Bus Splitter",
    shortTitle: "SPLIT",
    description: "Splits a 4-bit bus into individual bit signals.",
    inputs: [input("in", "In", 4)],
    outputs: [output("b0", "B0"), output("b1", "B1"), output("b2", "B2"), output("b3", "B3")],
    evaluate: ({ in: value }) => ({
      b0: busBit(value, 0),
      b1: busBit(value, 1),
      b2: busBit(value, 2),
      b3: busBit(value, 3),
    }),
  },
  joiner: {
    kind: "joiner",
    title: "Bus Joiner",
    shortTitle: "JOIN",
    description: "Joins four bit signals into one 4-bit bus.",
    inputs: [input("b0", "B0"), input("b1", "B1"), input("b2", "B2"), input("b3", "B3")],
    outputs: [output("out", "Out", 4)],
    evaluate: ({ b0, b1, b2, b3 }) => ({ out: busFromBits(b0, b1, b2, b3) }),
  },
  comparator: {
    kind: "comparator",
    title: "4-Bit Comparator",
    shortTitle: "CMP",
    description: "Compares two 4-bit numbers and emits EQ, LT, and GT.",
    inputs: [input("a", "A", 4), input("b", "B", 4)],
    outputs: [output("eq", "EQ"), output("lt", "LT"), output("gt", "GT")],
    evaluate: ({ a, b }) => ({
      eq: bool((a & mask(4)) === (b & mask(4))),
      lt: bool((a & mask(4)) < (b & mask(4))),
      gt: bool((a & mask(4)) > (b & mask(4))),
    }),
  },
  incrementer: {
    kind: "incrementer",
    title: "4-Bit Incrementer",
    shortTitle: "INC",
    description: "Adds one to a 4-bit bus and wraps at 15.",
    inputs: [input("in", "In", 4)],
    outputs: [output("out", "Out", 4), output("carry", "CARRY")],
    evaluate: ({ in: value }) => {
      const total = (value & mask(4)) + 1;
      return { out: total & mask(4), carry: bool(total > mask(4)) };
    },
  },
  subtractor: {
    kind: "subtractor",
    title: "4-Bit Subtractor",
    shortTitle: "SUB",
    description: "Subtracts B from A and emits a 4-bit difference plus borrow.",
    inputs: [input("a", "A", 4), input("b", "B", 4)],
    outputs: [output("out", "Out", 4), output("borrow", "BORROW")],
    evaluate: ({ a, b }) => ({
      out: (a - b) & mask(4),
      borrow: bool((a & mask(4)) < (b & mask(4))),
    }),
  },
};

export const gateDefinitions: Record<GateKind, ComponentDefinition> = {
  const0: componentDefinitions.const0,
  const1: componentDefinitions.const1,
  not: componentDefinitions.not,
  and: componentDefinitions.and,
  or: componentDefinitions.or,
  xor: componentDefinitions.xor,
  halfAdder: componentDefinitions.halfAdder,
  fullAdder: componentDefinitions.fullAdder,
  adder2: componentDefinitions.adder2,
  adder4: componentDefinitions.adder4,
  bus4: componentDefinitions.bus4,
  splitter: componentDefinitions.splitter,
  joiner: componentDefinitions.joiner,
  comparator: componentDefinitions.comparator,
  incrementer: componentDefinitions.incrementer,
  subtractor: componentDefinitions.subtractor,
};

export function getDefinition(kind: ComponentKind): ComponentDefinition {
  return componentDefinitions[kind];
}

export function getNodePortWidth(node: CircuitNode, direction: PortDirection, portId: string): number {
  const definition = getDefinition(node.data.kind);
  const port = (direction === "in" ? definition.inputs : definition.outputs).find(
    (candidate) => candidate.id === portId,
  );
  if (!port) return 1;
  if ((node.data.kind === "input" || node.data.kind === "output") && portId === (direction === "in" ? "in" : "out")) {
    return Number(node.data.width ?? port.width);
  }
  return port.width;
}

export function getMaxValueForNode(node: CircuitNode): number {
  const width = Number(node.data.width ?? 1);
  return mask(Math.max(1, width));
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
