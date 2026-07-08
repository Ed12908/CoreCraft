import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CircuitEdge, CircuitNode, GateKind, SavedCircuit } from "../engine/types";

export type ProgressState = {
  currentLevelIndex: number;
  solvedLevelIds: string[];
  unlockedComponents: GateKind[];
  circuits: Record<string, SavedCircuit>;
  setCurrentLevelIndex: (index: number) => void;
  markSolved: (levelId: string, unlocks: GateKind[]) => void;
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
      circuits: {},
      setCurrentLevelIndex: (index) => set({ currentLevelIndex: index }),
      markSolved: (levelId, unlocks) =>
        set((state) => ({
          solvedLevelIds: unique([...state.solvedLevelIds, levelId]),
          unlockedComponents: unique([...state.unlockedComponents, ...unlocks]),
        })),
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
          circuits: {},
        }),
    }),
    {
      name: "microcpu-builder-progress",
      version: 1,
    },
  ),
);
