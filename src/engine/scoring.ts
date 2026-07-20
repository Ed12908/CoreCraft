import type { CircuitNode, Level, LevelScore } from "./types";

export const LEVEL_SOLVED_POINTS = 100;
export const MINIMAL_SOLUTION_BONUS_POINTS = 50;

export function maxPointsForLevel(): number {
  return LEVEL_SOLVED_POINTS + MINIMAL_SOLUTION_BONUS_POINTS;
}

export function countPlacedComponents(nodes: CircuitNode[]): number {
  return nodes.filter((node) => node.data.kind !== "input" && node.data.kind !== "output").length;
}

export function scoreCircuit(level: Level, nodes: CircuitNode[], awardedAt = new Date().toISOString()): LevelScore {
  const usedComponents = countPlacedComponents(nodes);
  const minimal = usedComponents <= level.minimumComponents;
  const maxPoints = maxPointsForLevel();

  return {
    points: LEVEL_SOLVED_POINTS + (minimal ? MINIMAL_SOLUTION_BONUS_POINTS : 0),
    maxPoints,
    usedComponents,
    minimumComponents: level.minimumComponents,
    minimal,
    awardedAt,
  };
}

export function isBetterScore(candidate: LevelScore, current: LevelScore | undefined): boolean {
  if (!current) return true;
  if (candidate.points !== current.points) return candidate.points > current.points;
  return candidate.usedComponents < current.usedComponents;
}
