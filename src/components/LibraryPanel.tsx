import { gateDefinitions } from "../engine/componentRegistry";
import type { GateKind } from "../engine/types";
import { CyberButton } from "./CyberButton";
import { UiIcon } from "./UiIcons";

type LibraryPanelProps = {
  allowedComponents: GateKind[];
  unlockedComponents: GateKind[];
  onAddComponent: (kind: GateKind) => void;
};

const allGateKinds: GateKind[] = ["not", "and", "or", "xor"];

export function LibraryPanel({ allowedComponents, unlockedComponents, onAddComponent }: LibraryPanelProps) {
  return (
    <section className="cyber-panel rail-panel component-library">
      <div>
        <div className="rail-heading">Component Library</div>
        <p className="rail-subtitle">Drag a component onto the canvas</p>
      </div>

      <div className="component-list">
        {allowedComponents.length === 0 && (
          <div className="system-note">
            <span>This level only needs a wire</span>
          </div>
        )}

        {allowedComponents.map((kind) => {
          const definition = gateDefinitions[kind];
          return (
            <fieldset
              aria-label={`${definition.title} component`}
              className={`component-card component-${kind}`}
              draggable
              key={kind}
              onDragStart={(event) => {
                event.dataTransfer.setData("application/microcpu-component", kind);
                event.dataTransfer.effectAllowed = "move";
              }}
            >
              <div className="component-card-main">
                <UiIcon className="component-icon" name={kind} />
                <div className="component-copy">
                  <div className="component-title">{definition.title}</div>
                  <div className="component-desc">{definition.description}</div>
                </div>
                <div className="component-meta">
                  <span className="component-chip">{definition.shortTitle}</span>
                  <span className="component-port-count">
                    <span />
                    {definition.inputs.length}
                  </span>
                </div>
              </div>
              <CyberButton size="sm" variant="library" wide onClick={() => onAddComponent(kind)}>
                Drag to add
              </CyberButton>
            </fieldset>
          );
        })}
      </div>

      <div className="unlocked-strip">
        <h3>Unlocked so far</h3>
        <div className="unlock-list">
          {allGateKinds.map((kind) => {
            const unlocked = unlockedComponents.includes(kind) || allowedComponents.includes(kind);
            return (
              <span className={`unlock-badge ${unlocked ? "is-unlocked" : ""}`} key={kind}>
                {gateDefinitions[kind].shortTitle}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
