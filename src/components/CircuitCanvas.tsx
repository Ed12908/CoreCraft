import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { getDefinition, getNodePortWidth, parseHandleId } from "../engine/componentRegistry";
import { createGateNode } from "../engine/nodeFactory";
import type { SimulationResult } from "../engine/simulator";
import type { CircuitEdge, CircuitNode, GateKind } from "../engine/types";
import { makeId } from "../utils/id";
import { CircuitRuntimeContext } from "./CircuitRuntimeContext";
import { ComponentNode } from "./ComponentNode";
import { WireEdge } from "./WireEdge";

const nodeTypes = {
  component: ComponentNode,
};

const edgeTypes = {
  wire: WireEdge,
};

type CircuitCanvasProps = {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  simulation: SimulationResult;
  onNodesChange: (changes: NodeChange<CircuitNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CircuitEdge>[]) => void;
  setNodes: React.Dispatch<React.SetStateAction<CircuitNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<CircuitEdge[]>>;
  toggleInput: (nodeId: string) => void;
  onMessage: (message: string) => void;
};

function formatWireValue(value: number | undefined, width: number): string {
  if (value === undefined) return "?";
  if (width <= 1) return String(value);
  return `0x${value.toString(16).toUpperCase()}`;
}

function getConnectionWidths(
  connection: Connection,
  nodes: CircuitNode[],
): { sourceWidth: number; targetWidth: number } | null {
  const source = parseHandleId(connection.sourceHandle);
  const target = parseHandleId(connection.targetHandle);
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!source || !target || !sourceNode || !targetNode) return null;

  return {
    sourceWidth: getNodePortWidth(sourceNode, "out", source.portId),
    targetWidth: getNodePortWidth(targetNode, "in", target.portId),
  };
}

function isConnectionValid(connection: Connection, edges: CircuitEdge[], nodes: CircuitNode[]): boolean {
  const source = parseHandleId(connection.sourceHandle);
  const target = parseHandleId(connection.targetHandle);

  if (!source || !target) return false;
  if (source.direction !== "out" || target.direction !== "in") return false;
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;
  const widths = getConnectionWidths(connection, nodes);
  if (!widths || widths.sourceWidth !== widths.targetWidth) return false;

  return !edges.some((edge) => edge.target === connection.target && edge.targetHandle === connection.targetHandle);
}

export function CircuitCanvas({
  nodes,
  edges,
  simulation,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  toggleInput,
  onMessage,
}: CircuitCanvasProps) {
  const { screenToFlowPosition } = useReactFlow<CircuitNode, CircuitEdge>();

  const displayEdges = useMemo(
    () =>
      edges.map((edge) => {
        const value = simulation.edgeValues[edge.id];
        const source = parseHandleId(edge.sourceHandle);
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const width = source && sourceNode ? getNodePortWidth(sourceNode, "out", source.portId) : 1;
        return {
          ...edge,
          type: "wire",
          animated: value !== undefined && value !== 0,
          label: formatWireValue(value, width),
          className: value === undefined ? "signal-unknown" : value === 0 ? "signal-low" : "signal-high",
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 8,
        };
      }),
    [edges, nodes, simulation.edgeValues],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isConnectionValid(connection, edges, nodes)) {
        onMessage("Invalid wire. Match port direction, width, and use one driver per input.");
        return;
      }

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            id: makeId("wire"),
            type: "wire",
          },
          currentEdges,
        ),
      );
      onMessage("Wire connected.");
    },
    [edges, nodes, onMessage, setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData("application/microcpu-component") as GateKind;
      if (!kind) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setNodes((currentNodes) => [...currentNodes, createGateNode(kind, position)]);
      onMessage(`${getDefinition(kind).shortTitle} added.`);
    },
    [onMessage, screenToFlowPosition, setNodes],
  );

  return (
    <CircuitRuntimeContext.Provider value={{ simulation, toggleInput }}>
      <div className="circuit-flow">
        <ReactFlow<CircuitNode, CircuitEdge>
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode={["Backspace", "Delete"]}
          snapToGrid
          snapGrid={[12, 12]}
          className="micro-flow-grid"
        >
          <Background color="#184f84" gap={28} size={1.2} />
          <Controls className="flow-controls" position="bottom-left" />
          <MiniMap
            className="flow-minimap"
            maskColor="rgba(1, 10, 28, 0.68)"
            nodeColor="#172641"
            nodeStrokeColor="#35d9ff"
            nodeStrokeWidth={1.5}
            pannable
            position="bottom-right"
            zoomable
          />
        </ReactFlow>
      </div>
    </CircuitRuntimeContext.Provider>
  );
}
