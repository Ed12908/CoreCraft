import { CyberButton } from "./CyberButton";
import { UiIcon } from "./UiIcons";

type TopHudProps = {
  currentLevel: number;
  levelCount: number;
  maxPoints: number;
  progressPercent: number;
  solvedCount: number;
  totalPoints: number;
  onClearProgress: () => void;
};

type ScoreModuleProps = {
  points: number;
};

type LevelModuleProps = {
  level: number;
};

function ScoreModule({ points }: ScoreModuleProps) {
  return (
    <div className="hud-score-module">
      <span className="hud-score-icon">
        <UiIcon name="xp" />
      </span>
      <strong>{points}</strong>
      <span>pts</span>
    </div>
  );
}

function LevelModule({ level }: LevelModuleProps) {
  return (
    <div className="hud-level-module">
      <div className="hud-level-content">
        <span>Level</span>
        <strong>{level}</strong>
      </div>
    </div>
  );
}

export function TopHud({
  currentLevel,
  levelCount,
  maxPoints,
  progressPercent,
  solvedCount,
  totalPoints,
  onClearProgress,
}: TopHudProps) {
  return (
    <header className="top-hud">
      <section className="hud-section brand-section" aria-label="Application">
        <div className="brand-chip">
          <UiIcon name="chip" />
        </div>
        <div className="brand-copy">
          <h1>MicroCPU Builder</h1>
          <p>Logic gates to a 4-bit processor</p>
        </div>
      </section>

      <section className="hud-section progress-section" aria-label="Level progress">
        <div className="progress-inner">
          <div className="hud-label">Level Progress</div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-readout">
            <span>
              {solvedCount} / {levelCount} levels solved
            </span>
            <span>
              {totalPoints} / {maxPoints} pts
            </span>
          </div>
        </div>
      </section>

      <section className="hud-section actions-section" aria-label="Score and actions">
        <ScoreModule points={totalPoints} />
        <LevelModule level={currentLevel} />
        <CyberButton iconStart={<UiIcon name="refresh" />} size="sm" variant="ghost" onClick={onClearProgress}>
          Clear progress
        </CyberButton>
      </section>
    </header>
  );
}
