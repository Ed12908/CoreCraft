import type { Level } from "../engine/types";

type LevelNavigatorProps = {
  levels: Level[];
  currentIndex: number;
  solvedLevelIds: string[];
  onSelect: (index: number) => void;
};

export function LevelNavigator({ levels, currentIndex, solvedLevelIds, onSelect }: LevelNavigatorProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Levels</h2>
      <div className="space-y-1">
        {levels.map((level, index) => {
          const solved = solvedLevelIds.includes(level.id);
          const locked = index > 0 && !solvedLevelIds.includes(levels[index - 1].id);
          return (
            <button
              className={`btn btn-sm w-full justify-start ${index === currentIndex ? "btn-primary" : "btn-ghost"}`}
              disabled={locked}
              key={level.id}
              onClick={() => onSelect(index)}
              type="button"
            >
              <span className="badge badge-xs">{index + 1}</span>
              <span className="truncate">{level.title}</span>
              {solved && <span className="badge badge-success badge-xs ml-auto">pass</span>}
              {locked && <span className="badge badge-ghost badge-xs ml-auto">lock</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
