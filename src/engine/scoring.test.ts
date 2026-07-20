import { describe, expect, it } from "vitest";
import type { CircuitNode, Level } from "./types";
import { MINIMAL_SOLUTION_BONUS_POINTS, LEVEL_SOLVED_POINTS, countPlacedComponents, scoreCircuit } from "./scoring";

function node(id: string, kind: CircuitNode["data"]["kind"]): CircuitNode {
  return {
    id,
    type: "component",
    position: { x: 0, y: 0 },
    data: { kind, label: id },
  };
}

function level(minimumComponents: number): Level {
  return {
    id: "test",
    title: "Test",
    chapter: "Test",
    prompt: "Test",
    allowedComponents: ["not", "and"],
    minimumComponents,
    givens: [],
    tests: [],
    unlocks: [],
    hints: [],
    successMessage: "Done",
  };
}

describe("scoreCircuit", () => {
  it("counts only placed gate components", () => {
    const nodes = [node("a", "input"), node("not", "not"), node("and", "and"), node("out", "output")];

    expect(countPlacedComponents(nodes)).toBe(2);
  });

  it("awards the minimal solution bonus when the gate count is at or below target", () => {
    const score = scoreCircuit(level(2), [node("not", "not"), node("and", "and")], "2026-01-01T00:00:00.000Z");

    expect(score.points).toBe(LEVEL_SOLVED_POINTS + MINIMAL_SOLUTION_BONUS_POINTS);
    expect(score.minimal).toBe(true);
  });

  it("withholds the bonus when the circuit uses extra gates", () => {
    const score = scoreCircuit(level(1), [node("not-a", "not"), node("not-b", "not")], "2026-01-01T00:00:00.000Z");

    expect(score.points).toBe(LEVEL_SOLVED_POINTS);
    expect(score.minimal).toBe(false);
  });
});
