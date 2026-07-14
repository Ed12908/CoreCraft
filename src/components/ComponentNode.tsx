import { memo } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import type { CircuitEdge, CircuitNode, ComponentKind } from "../engine/types";
import { getDefinition, handleId } from "../engine/componentRegistry";
import { useCircuitRuntime } from "./CircuitRuntimeContext";
import { DeleteIcon } from "./DeleteIcon";

function portTop(index: number, count: number): string {
  if (count === 1) return "50%";
  const spacing = 100 / (count + 1);
  return `${spacing * (index + 1)}%`;
}

function kindBadge(kind: ComponentKind): string {
  if (kind === "input") return "badge-info";
  if (kind === "output") return "badge-warning";
  return "badge-primary";
}

function valueClass(value: 0 | 1 | undefined): string {
  if (value === 1) return "badge-success";
  if (value === 0) return "badge-neutral";
  return "badge-ghost";
}

function formatValue(value: 0 | 1 | undefined): string {
  return value === undefined ? "?" : String(value);
}

function ComponentNodeBase({ id, data, selected, deletable }: NodeProps<CircuitNode>) {
  const definition = getDefinition(data.kind);
  const { simulation, toggleInput } = useCircuitRuntime();
  const { deleteElements } = useReactFlow<CircuitNode, CircuitEdge>();
  const outputValue = simulation.nodeOutputs[id]?.out;
  const inputValue = simulation.nodeInputs[id]?.in;

  return (
    <div className="micro-node card border border-base-300 bg-base-100" data-selected={selected ? "true" : "false"}>
      {deletable && (
        <button
          aria-label={`Delete ${data.label}`}
          className="micro-delete-button micro-node-delete nodrag nopan"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void deleteElements({ nodes: [{ id }] });
          }}
          title={`Delete ${data.label}`}
          type="button"
        >
          <DeleteIcon />
        </button>
      )}

      {definition.inputs.map((port, index) => (
        <Handle
          key={port.id}
          id={handleId("in", port.id)}
          type="target"
          position={Position.Left}
          style={{ top: portTop(index, definition.inputs.length) }}
        />
      ))}

      {definition.outputs.map((port, index) => (
        <Handle
          key={port.id}
          id={handleId("out", port.id)}
          type="source"
          position={Position.Right}
          style={{ top: portTop(index, definition.outputs.length) }}
        />
      ))}

      <div className="card-body gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold leading-tight">{data.label}</div>
            <div className="text-xs opacity-65">{definition.title}</div>
          </div>
          <span className={`badge badge-sm ${kindBadge(data.kind)}`}>{definition.shortTitle}</span>
        </div>

        {data.kind === "input" && (
          <div className="flex items-center justify-between rounded-box bg-base-200 px-2 py-1">
            <span className="text-xs opacity-75">value</span>
            <button
              className={`btn btn-xs ${outputValue === 1 ? "btn-success" : "btn-outline"}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleInput(id);
              }}
              type="button"
            >
              {formatValue(outputValue)}
            </button>
          </div>
        )}

        {data.kind === "output" && (
          <div className="flex items-center justify-between rounded-box bg-base-200 px-2 py-1">
            <span className="text-xs opacity-75">signal</span>
            <span className={`badge ${valueClass(inputValue)}`}>{formatValue(inputValue)}</span>
          </div>
        )}

        {data.kind !== "input" && data.kind !== "output" && (
          <div className="grid grid-cols-2 gap-2 rounded-box bg-base-200 p-2">
            <div className="space-y-1">
              {definition.inputs.map((port) => (
                <div className="micro-port-label flex justify-between gap-2" key={port.id}>
                  <span>{port.label}</span>
                  <span className={`badge badge-xs ${valueClass(simulation.nodeInputs[id]?.[port.id])}`}>
                    {formatValue(simulation.nodeInputs[id]?.[port.id])}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {definition.outputs.map((port) => (
                <div className="micro-port-label flex justify-between gap-2" key={port.id}>
                  <span>{port.label}</span>
                  <span className={`badge badge-xs ${valueClass(simulation.nodeOutputs[id]?.[port.id])}`}>
                    {formatValue(simulation.nodeOutputs[id]?.[port.id])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ComponentNode = memo(ComponentNodeBase);
