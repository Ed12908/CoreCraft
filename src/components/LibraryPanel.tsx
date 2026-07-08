import type { GateKind } from "../engine/types";
import { gateDefinitions } from "../engine/componentRegistry";

type LibraryPanelProps = {
  allowedComponents: GateKind[];
  unlockedComponents: GateKind[];
  onAddComponent: (kind: GateKind) => void;
};

const allGateKinds: GateKind[] = ["not", "and", "or", "xor"];

export function LibraryPanel({ allowedComponents, unlockedComponents, onAddComponent }: LibraryPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Component library</h2>
        <p className="mt-1 text-xs opacity-65">Drag a part onto the canvas, or use Add.</p>
      </div>

      <div className="space-y-2">
        {allowedComponents.length === 0 && (
          <div className="alert py-2 text-sm">
            <span>This level only needs a wire.</span>
          </div>
        )}

        {allowedComponents.map((kind) => {
          const definition = gateDefinitions[kind];
          return (
            <div
              className="card cursor-grab border border-base-300 bg-base-100 active:cursor-grabbing"
              draggable
              key={kind}
              onDragStart={(event) => {
                event.dataTransfer.setData("application/microcpu-component", kind);
                event.dataTransfer.effectAllowed = "move";
              }}
            >
              <div className="card-body gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{definition.title}</div>
                    <div className="text-xs opacity-65">{definition.description}</div>
                  </div>
                  <span className="badge badge-primary">{definition.shortTitle}</span>
                </div>
                <button className="btn btn-sm btn-outline" type="button" onClick={() => onAddComponent(kind)}>
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70">Unlocked so far</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {allGateKinds.map((kind) => {
            const unlocked = unlockedComponents.includes(kind) || allowedComponents.includes(kind);
            return (
              <span className={`badge ${unlocked ? "badge-success" : "badge-ghost"}`} key={kind}>
                {gateDefinitions[kind].shortTitle}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
