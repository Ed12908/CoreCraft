import { describe, expect, it } from "vitest";
import type { CircuitEdge, CircuitNode } from "./types";
import { simulateCircuit } from "./simulator";

function node(id: string, kind: CircuitNode["data"]["kind"], label = id): CircuitNode {
  return {
    id,
    type: "component",
    position: { x: 0, y: 0 },
    data: { kind, label, value: 0 },
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
});
