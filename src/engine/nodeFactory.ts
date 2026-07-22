import { makeId } from "../utils/id";
import type { CircuitNode, GateKind, LevelGiven } from "./types";

export function createGivenNode(given: LevelGiven): CircuitNode {
  return {
    id: given.id,
    type: "component",
    position: given.position,
    deletable: false,
    data: {
      kind: given.kind,
      label: given.label,
      fixed: true,
      value: 0,
    },
  };
}

export function createGateNode(kind: GateKind, position: { x: number; y: number }): CircuitNode {
  return {
    id: makeId(kind),
    type: "component",
    position,
    data: {
      kind,
      label: kind.toUpperCase(),
    },
  };
}
