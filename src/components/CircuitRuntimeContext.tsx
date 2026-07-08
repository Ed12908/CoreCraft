import { createContext, useContext } from "react";
import type { SimulationResult } from "../engine/simulator";

export type CircuitRuntime = {
  simulation: SimulationResult;
  toggleInput: (nodeId: string) => void;
};

export const CircuitRuntimeContext = createContext<CircuitRuntime | null>(null);

export function useCircuitRuntime(): CircuitRuntime {
  const runtime = useContext(CircuitRuntimeContext);
  if (!runtime) {
    throw new Error("CircuitRuntimeContext is missing.");
  }
  return runtime;
}
