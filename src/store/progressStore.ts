import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isBetterScore } from "../engine/scoring";
import type { CircuitEdge, CircuitNode, GateKind, LevelScore, SavedCircuit } from "../engine/types";

export type ProgressState = {
  currentLevelIndex: number;
  solvedLevelIds: string[];
  unlockedComponents: GateKind[];
  levelScores: Record<string, LevelScore>;
  circuits: Record<string, SavedCircuit>;
  setCurrentLevelIndex: (index: number) => void;
  markSolved: (levelId: string, unlocks: GateKind[], score: LevelScore) => void;
  saveCircuit: (levelId: string, nodes: CircuitNode[], edges: CircuitEdge[]) => void;
  clearCircuit: (levelId: string) => void;
  clearAllProgress: () => void;
};

const initialUnlocked: GateKind[] = [];

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      currentLevelIndex: 0,
      solvedLevelIds: [],
      unlockedComponents: initialUnlocked,
      levelScores: {},
      circuits: {},
      setCurrentLevelIndex: (index) => set({ currentLevelIndex: index }),
      markSolved: (levelId, unlocks, score) =>
        set((state) => {
          const levelScores = state.levelScores ?? {};
          const currentScore = levelScores[levelId];
          return {
            solvedLevelIds: unique([...state.solvedLevelIds, levelId]),
            unlockedComponents: unique([...state.unlockedComponents, ...unlocks]),
            levelScores: isBetterScore(score, currentScore)
              ? {
                  ...levelScores,
                  [levelId]: score,
                }
              : levelScores,
          };
        }),
      saveCircuit: (levelId, nodes, edges) =>
        set((state) => ({
          circuits: {
            ...state.circuits,
            [levelId]: {
              nodes,
              edges,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
      clearCircuit: (levelId) =>
        set((state) => {
          const { [levelId]: _removed, ...circuits } = state.circuits;
          return { circuits };
        }),
      clearAllProgress: () =>
        set({
          currentLevelIndex: 0,
          solvedLevelIds: [],
          unlockedComponents: initialUnlocked,
          levelScores: {},
          circuits: {},
        }),
    }),
    {
      name: "microcpu-builder-progress",
      version: 1,
    },
  ),
);
