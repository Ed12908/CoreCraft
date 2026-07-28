import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo } from "react";
import { getDefinition, handleId } from "../engine/componentRegistry";
import type { CircuitEdge, CircuitNode, ComponentKind } from "../engine/types";
import { useCircuitRuntime } from "./CircuitRuntimeContext";
import { DeleteIcon } from "./DeleteIcon";
import { UiIcon } from "./UiIcons";

function portTop(index: number, count: number): string {
  if (count === 1) return "50%";
  const spacing = 100 / (count + 1);
  return `${spacing * (index + 1)}%`;
}

function kindBadge(kind: ComponentKind): string {
  if (kind === "input") return "node-badge-info";
  if (kind === "output") return "node-badge-warning";
  return "node-badge-primary";
}

function valueClass(value: 0 | 1 | undefined): string {
  if (value === 1) return "is-high";
  if (value === 0) return "is-low";
  return "is-unknown";
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
    <div className={`micro-node micro-node-${data.kind}`} data-selected={selected ? "true" : "false"}>
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

      <div className="micro-node-body">
        <div className="micro-node-header">
          <div>
            <div className="micro-node-title">{data.label}</div>
            <div className="micro-node-subtitle">{definition.title}</div>
          </div>
          <span className={`micro-node-badge ${kindBadge(data.kind)}`}>{definition.shortTitle}</span>
        </div>

        {data.kind === "input" && (
          <div className="node-value-row">
            <span>value</span>
            <button
              className={`node-value-button ${valueClass(outputValue)}`}
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
          <div className="node-value-row">
            <span>signal</span>
            <span className={`node-value-pill ${valueClass(inputValue)}`}>{formatValue(inputValue)}</span>
          </div>
        )}

        {data.kind !== "input" && data.kind !== "output" && (
          <div className="micro-port-grid">
            <div className="micro-port-column">
              {definition.inputs.map((port) => (
                <div className="micro-port-label" key={port.id}>
                  <span>{port.label}</span>
                  <span className={`node-value-pill ${valueClass(simulation.nodeInputs[id]?.[port.id])}`}>
                    {formatValue(simulation.nodeInputs[id]?.[port.id])}
                  </span>
                </div>
              ))}
            </div>
            <div className="micro-port-column">
              {definition.outputs.map((port) => (
                <div className="micro-port-label" key={port.id}>
                  <span>{port.label}</span>
                  <span className={`node-value-pill ${valueClass(simulation.nodeOutputs[id]?.[port.id])}`}>
                    {formatValue(simulation.nodeOutputs[id]?.[port.id])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.kind === "input" && <UiIcon name="switch" className="node-watermark" />}
        {data.kind === "output" && <UiIcon name="lamp" className="node-watermark" />}
      </div>
    </div>
  );
}

export const ComponentNode = memo(ComponentNodeBase);
