import { describe, expect, it } from "vitest";
import { simulateCircuit } from "./simulator";
import type { CircuitEdge, CircuitNode } from "./types";

function node(id: string, kind: CircuitNode["data"]["kind"], label = id): CircuitNode {
  return {
    id,
    type: "component",
    position: { x: 0, y: 0 },
    data: { kind, label, value: 0 },
  };
}

function busNode(id: string, kind: CircuitNode["data"]["kind"], label = id, width = 4): CircuitNode {
  return {
    id,
    type: "component",
    position: { x: 0, y: 0 },
    data: { kind, label, value: 0, width },
  };
}

function edge(id: string, source: string, sourcePort: string, target: string, targetPort: string): CircuitEdge {
  return {
    id,
    source,
    target,
    sourceHandle: `out:${sourcePort}`,
    targetHandle: `in:${targetPort}`,
  };
}

describe("simulateCircuit", () => {
  it("copies an input to an output", () => {
    const nodes = [node("a", "input", "A"), node("out", "output", "OUT")];
    const edges = [edge("e1", "a", "out", "out", "in")];

    expect(simulateCircuit(nodes, edges, { A: 0 }).outputsByLabel.OUT).toBe(0);
    expect(simulateCircuit(nodes, edges, { A: 1 }).outputsByLabel.OUT).toBe(1);
  });

  it("evaluates a NOT gate", () => {
    const nodes = [node("a", "input", "A"), node("not", "not"), node("out", "output", "OUT")];
    const edges = [edge("e1", "a", "out", "not", "in"), edge("e2", "not", "out", "out", "in")];

    expect(simulateCircuit(nodes, edges, { A: 0 }).outputsByLabel.OUT).toBe(1);
    expect(simulateCircuit(nodes, edges, { A: 1 }).outputsByLabel.OUT).toBe(0);
  });

  it("allows fan-out from one output to multiple inputs", () => {
    const nodes = [node("a", "input", "A"), node("b", "input", "B"), node("and", "and"), node("out", "output", "OUT")];
    const edges = [
      edge("e1", "a", "out", "and", "a"),
      edge("e2", "b", "out", "and", "b"),
      edge("e3", "and", "out", "out", "in"),
    ];

    expect(simulateCircuit(nodes, edges, { A: 1, B: 1 }).outputsByLabel.OUT).toBe(1);
    expect(simulateCircuit(nodes, edges, { A: 1, B: 0 }).outputsByLabel.OUT).toBe(0);
  });

  it("splits and rejoins a 4-bit bus", () => {
    const nodes = [
      busNode("a", "input", "A"),
      node("split", "splitter"),
      node("join", "joiner"),
      busNode("out", "output", "OUT"),
    ];
    const edges = [
      edge("e1", "a", "out", "split", "in"),
      edge("e2", "split", "b0", "join", "b0"),
      edge("e3", "split", "b1", "join", "b1"),
      edge("e4", "split", "b2", "join", "b2"),
      edge("e5", "split", "b3", "join", "b3"),
      edge("e6", "join", "out", "out", "in"),
    ];

    expect(simulateCircuit(nodes, edges, { A: 0xa }).outputsByLabel.OUT).toBe(0xa);
    expect(simulateCircuit(nodes, edges, { A: 0xf }).outputsByLabel.OUT).toBe(0xf);
  });

  it("reports width mismatches", () => {
    const nodes = [busNode("a", "input", "A"), node("out", "output", "OUT")];
    const edges = [edge("e1", "a", "out", "out", "in")];

    const result = simulateCircuit(nodes, edges, { A: 0xa });

    expect(result.outputsByLabel.OUT).toBeUndefined();
    expect(result.issues.some((issue) => issue.code === "width-mismatch")).toBe(true);
  });
});
