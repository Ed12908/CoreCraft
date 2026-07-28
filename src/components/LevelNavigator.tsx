import type { Level, LevelScore } from "../engine/types";
import { UiIcon } from "./UiIcons";

type LevelNavigatorProps = {
  levels: Level[];
  currentIndex: number;
  solvedLevelIds: string[];
  levelScores: Record<string, LevelScore>;
  onSelect: (index: number) => void;
};

const levelIcons = ["switch", "wave", "circuit", "or", "xor", "sigma"] as const;

export function LevelNavigator({ levels, currentIndex, solvedLevelIds, levelScores, onSelect }: LevelNavigatorProps) {
  return (
    <section className="cyber-panel rail-panel">
      <div className="rail-heading">Mission Log</div>
      <div className="mission-list">
        {levels.map((level, index) => {
          const solved = solvedLevelIds.includes(level.id);
          const locked = index > 0 && !solvedLevelIds.includes(levels[index - 1].id);
          const score = levelScores[level.id];
          return (
            <button
              className={`mission-row ${index === currentIndex ? "is-active" : ""}`}
              disabled={locked}
              key={level.id}
              onClick={() => onSelect(index)}
              type="button"
            >
              <span className="mission-index">{index + 1}</span>
              <UiIcon className="mission-icon" name={levelIcons[index] ?? "circuit"} />
              <span className="mission-title">{level.title}</span>
              {solved && (
                <>
                  <span className="mission-score">+{score ? score.points : 100} pts</span>
                  <UiIcon className="mission-check" name="check" />
                </>
              )}
              {locked && <UiIcon className="mission-lock" name="lock" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
