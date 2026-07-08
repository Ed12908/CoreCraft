import { useCallback, useMemo } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type { CircuitEdge, CircuitNode, GateKind } from "../engine/types";
import { parseHandleId } from "../engine/componentRegistry";
import { createGateNode } from "../engine/nodeFactory";
import type { SimulationResult } from "../engine/simulator";
import { makeId } from "../utils/id";
import { ComponentNode } from "./ComponentNode";
import { CircuitRuntimeContext } from "./CircuitRuntimeContext";

const nodeTypes = {
  component: ComponentNode,
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

function isConnectionValid(connection: Connection, edges: CircuitEdge[]): boolean {
  const source = parseHandleId(connection.sourceHandle);
  const target = parseHandleId(connection.targetHandle);

  if (!source || !target) return false;
  if (source.direction !== "out" || target.direction !== "in") return false;
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;

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
        return {
          ...edge,
          animated: value === 1,
          label: value === undefined ? "?" : String(value),
          className: value === 1 ? "signal-high" : value === 0 ? "signal-low" : "signal-unknown",
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 8,
        };
      }),
    [edges, simulation.edgeValues],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isConnectionValid(connection, edges)) {
        onMessage("Invalid wire. Connect one output to one unused input.");
        return;
      }

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            id: makeId("wire"),
            type: "default",
          },
          currentEdges,
        ),
      );
      onMessage("Wire connected.");
    },
    [edges, onMessage, setEdges],
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
      onMessage(`${kind.toUpperCase()} gate added.`);
    },
    [onMessage, screenToFlowPosition, setNodes],
  );

  return (
    <CircuitRuntimeContext.Provider value={{ simulation, toggleInput }}>
      <div className="h-full overflow-hidden rounded-box border border-base-300 bg-base-200">
        <ReactFlow<CircuitNode, CircuitEdge>
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
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
          <Background gap={24} size={1} />
          <Controls position="bottom-left" />
          <MiniMap pannable zoomable position="bottom-right" />
        </ReactFlow>
      </div>
    </CircuitRuntimeContext.Provider>
  );
}
