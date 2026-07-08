import type { Bit, CircuitEdge, CircuitNode, Level, LogicCase } from "./types";
import { simulateCircuit } from "./simulator";

export type CaseResult = {
  testCase: LogicCase;
  actual: Record<string, Bit | undefined>;
  passed: boolean;
  messages: string[];
};

export type TestRunResult = {
  passed: boolean;
  passedCount: number;
  total: number;
  cases: CaseResult[];
};

export function runLevelTests(level: Level, nodes: CircuitNode[], edges: CircuitEdge[]): TestRunResult {
  const cases = level.tests.map((testCase): CaseResult => {
    const simulation = simulateCircuit(nodes, edges, testCase.inputs);
    const actual: Record<string, Bit | undefined> = {};
    const messages: string[] = [];

    for (const [label, expected] of Object.entries(testCase.outputs)) {
      const value = simulation.outputsByLabel[label];
      actual[label] = value;
      if (value !== expected) {
        messages.push(`${label} expected ${expected}, got ${value ?? "unknown"}.`);
      }
    }

    const structuralIssues = simulation.issues.filter((issue) => issue.code !== "missing-input");
    if (structuralIssues.length > 0) {
      messages.push(...structuralIssues.slice(0, 3).map((issue) => issue.message));
    }

    return {
      testCase,
      actual,
      passed: messages.length === 0,
      messages,
    };
  });

  const passedCount = cases.filter((testCase) => testCase.passed).length;

  return {
    cases,
    passedCount,
    total: cases.length,
    passed: passedCount === cases.length,
  };
}
