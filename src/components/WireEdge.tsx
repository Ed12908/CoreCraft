import { memo, useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { BaseEdge, EdgeToolbar, getBezierPath, useReactFlow, type EdgeProps } from "@xyflow/react";
import type { CircuitEdge, CircuitNode } from "../engine/types";
import { DeleteIcon } from "./DeleteIcon";

function WireEdgeBase({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  style,
  markerEnd,
  markerStart,
  interactionWidth,
  deletable,
}: EdgeProps<CircuitEdge>) {
  const { deleteElements } = useReactFlow<CircuitNode, CircuitEdge>();
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current === null) return;
    clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const showControls = useCallback(() => {
    clearHideTimer();
    setControlsVisible(true);
  }, [clearHideTimer]);

  const hideControls = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => setControlsVisible(false), 120);
  }, [clearHideTimer]);

  useEffect(() => clearHideTimer, [clearHideTimer]);

  const removeWire = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      void deleteElements({ edges: [{ id }] });
    },
    [deleteElements, id],
  );

  return (
    <g className="micro-wire-edge" onMouseEnter={showControls} onMouseLeave={hideControls}>
      <BaseEdge
        id={id}
        path={edgePath}
        labelX={labelX}
        labelY={labelY}
        label={label}
        labelStyle={labelStyle}
        labelShowBg={labelShowBg}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
        style={style}
        markerEnd={markerEnd}
        markerStart={markerStart}
        interactionWidth={interactionWidth ?? 28}
      />
      {deletable !== false && (
        <EdgeToolbar
          alignX="center"
          alignY="bottom"
          className="micro-wire-toolbar"
          edgeId={id}
          isVisible={controlsVisible}
          onMouseEnter={showControls}
          onMouseLeave={hideControls}
          x={labelX}
          y={labelY}
        >
          <button
            aria-label="Remove wire"
            className="micro-delete-button micro-wire-delete-button nodrag nopan"
            onClick={removeWire}
            title="Remove wire"
            type="button"
          >
            <DeleteIcon />
          </button>
        </EdgeToolbar>
      )}
    </g>
  );
}

export const WireEdge = memo(WireEdgeBase);
