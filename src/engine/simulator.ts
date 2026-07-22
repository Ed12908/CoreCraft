import { getDefinition, parseHandleId } from "./componentRegistry";
import type { Bit, CircuitEdge, CircuitNode } from "./types";

export type PortValueMap = Record<string, Record<string, Bit>>;

export type SimulationIssue = {
  code: "invalid-wire" | "missing-input" | "multiple-drivers" | "floating-source" | "feedback";
  message: string;
  nodeId?: string;
  portId?: string;
  edgeId?: string;
};

export type SimulationResult = {
  nodeInputs: PortValueMap;
  nodeOutputs: PortValueMap;
  edgeValues: Record<string, Bit | undefined>;
  outputsByLabel: Record<string, Bit | undefined>;
  issues: SimulationIssue[];
};

type OutputMap = Map<string, Bit>;
type IncomingMap = Map<string, CircuitEdge[]>;

function outputKey(nodeId: string, portId: string): string {
  return `${nodeId}.${portId}`;
}

function inputKey(nodeId: string, portId: string): string {
  return `${nodeId}.${portId}`;
}

function setPortValue(map: PortValueMap, nodeId: string, portId: string, value: Bit): void {
  map[nodeId] = map[nodeId] ?? {};
  map[nodeId][portId] = value;
}

function getSourceValue(edge: CircuitEdge, outputs: OutputMap): Bit | undefined {
  const parsed = parseHandleId(edge.sourceHandle);
  if (!parsed || parsed.direction !== "out") return undefined;
  return outputs.get(outputKey(edge.source, parsed.portId));
}

function createIncomingMap(edges: CircuitEdge[]): IncomingMap {
  const incoming = new Map<string, CircuitEdge[]>();

  for (const edge of edges) {
    const parsed = parseHandleId(edge.targetHandle);
    if (!parsed || parsed.direction !== "in") continue;

    const key = inputKey(edge.target, parsed.portId);
    const existing = incoming.get(key) ?? [];
    existing.push(edge);
    incoming.set(key, existing);
  }

  return incoming;
}

function readInputValue(nodeId: string, portId: string, incoming: IncomingMap, outputs: OutputMap): Bit | undefined {
  const edges = incoming.get(inputKey(nodeId, portId)) ?? [];
  if (edges.length !== 1) return undefined;
  return getSourceValue(edges[0], outputs);
}

function collectIssues(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  incoming: IncomingMap,
  outputs: OutputMap,
): SimulationIssue[] {
  const issues: SimulationIssue[] = [];

  for (const edge of edges) {
    const source = parseHandleId(edge.sourceHandle);
    const target = parseHandleId(edge.targetHandle);

    if (!source || source.direction !== "out" || !target || target.direction !== "in") {
      issues.push({
        code: "invalid-wire",
        message: "A wire must run from an output port to an input port.",
        edgeId: edge.id,
      });
      continue;
    }

    if (!outputs.has(outputKey(edge.source, source.portId))) {
      issues.push({
        code: "floating-source",
        message: "A wire is connected to a source that has no known signal yet.",
        edgeId: edge.id,
      });
    }
  }

  for (const node of nodes) {
    const definition = getDefinition(node.data.kind);

    for (const port of definition.inputs) {
      const key = inputKey(node.id, port.id);
      const inputEdges = incoming.get(key) ?? [];

      if (inputEdges.length === 0) {
        issues.push({
          code: "missing-input",
          message: `${node.data.label}.${port.label} is not connected.`,
          nodeId: node.id,
          portId: port.id,
        });
      } else if (inputEdges.length > 1) {
        issues.push({
          code: "multiple-drivers",
          message: `${node.data.label}.${port.label} has more than one incoming wire.`,
          nodeId: node.id,
          portId: port.id,
        });
      } else if (readInputValue(node.id, port.id, incoming, outputs) === undefined) {
        issues.push({
          code: "floating-source",
          message: `${node.data.label}.${port.label} is connected to an unknown signal.`,
          nodeId: node.id,
          portId: port.id,
        });
      }
    }
  }

  const unknownGateOutputs = nodes.some((node) => {
    const definition = getDefinition(node.data.kind);
    return Boolean(definition.evaluate && definition.outputs.some((port) => !outputs.has(outputKey(node.id, port.id))));
  });

  if (unknownGateOutputs && issues.length === 0) {
    issues.push({
      code: "feedback",
      message: "This circuit did not settle. Feedback loops need a clocked component in later chapters.",
    });
  }

  return issues;
}

export function simulateCircuit(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  inputOverrides: Record<string, Bit> = {},
): SimulationResult {
  const outputs: OutputMap = new Map();
  const incoming = createIncomingMap(edges);

  for (const node of nodes) {
    if (node.data.kind === "input") {
      const value = inputOverrides[node.data.label] ?? node.data.value ?? 0;
      outputs.set(outputKey(node.id, "out"), value);
    }
  }

  const maxIterations = Math.max(4, nodes.length * 4);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    let changed = false;

    for (const node of nodes) {
      const definition = getDefinition(node.data.kind);
      if (!definition.evaluate) continue;

      const values: Record<string, Bit> = {};
      let ready = true;

      for (const port of definition.inputs) {
        const value = readInputValue(node.id, port.id, incoming, outputs);
        if (value === undefined) {
          ready = false;
          break;
        }
        values[port.id] = value;
      }

      if (!ready) continue;

      const nextOutputs = definition.evaluate(values);
      for (const [portId, value] of Object.entries(nextOutputs)) {
        const key = outputKey(node.id, portId);
        if (outputs.get(key) !== value) {
          outputs.set(key, value);
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  const nodeInputs: PortValueMap = {};
  const nodeOutputs: PortValueMap = {};

  for (const node of nodes) {
    const definition = getDefinition(node.data.kind);

    for (const port of definition.inputs) {
      const value = readInputValue(node.id, port.id, incoming, outputs);
      if (value !== undefined) setPortValue(nodeInputs, node.id, port.id, value);
    }

    for (const port of definition.outputs) {
      const value = outputs.get(outputKey(node.id, port.id));
      if (value !== undefined) setPortValue(nodeOutputs, node.id, port.id, value);
    }
  }

  const edgeValues = Object.fromEntries(edges.map((edge) => [edge.id, getSourceValue(edge, outputs)]));

  const outputsByLabel: Record<string, Bit | undefined> = {};
  for (const node of nodes) {
    if (node.data.kind !== "output") continue;
    outputsByLabel[node.data.label] = readInputValue(node.id, "in", incoming, outputs);
  }

  return {
    nodeInputs,
    nodeOutputs,
    edgeValues,
    outputsByLabel,
    issues: collectIssues(nodes, edges, incoming, outputs),
  };
}
