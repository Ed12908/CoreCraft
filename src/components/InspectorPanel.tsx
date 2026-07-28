import type { TestRunResult } from "../engine/runLevelTests";
import { maxPointsForLevel } from "../engine/scoring";
import type { SimulationResult } from "../engine/simulator";
import type { Bit, Level, LevelScore } from "../engine/types";
import { UiIcon } from "./UiIcons";

type InspectorPanelProps = {
  level: Level;
  simulation: SimulationResult;
  testRun: TestRunResult | null;
  levelScore: LevelScore | undefined;
  currentUsedComponents: number;
  statusMessage: string;
  onRunTests: () => void;
  onReset: () => void;
  onNext: () => void;
  canGoNext: boolean;
  solved: boolean;
};

function renderBits(values: Record<string, Bit>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("  ");
}

export function InspectorPanel({
  level,
  simulation,
  testRun,
  levelScore,
  currentUsedComponents,
  statusMessage,
  onRunTests,
  onReset,
  onNext,
  canGoNext,
  solved,
}: InspectorPanelProps) {
  const visibleIssues = simulation.issues.slice(0, 4);
  const currentMinimal = currentUsedComponents <= level.minimumComponents;
  const bestPoints = levelScore ? `${levelScore.points}/${levelScore.maxPoints}` : `0/${maxPointsForLevel()}`;

  return (
    <div className="inspector-stack">
      <section className="cyber-panel challenge-panel">
        <div className="rail-heading">Current Challenge</div>
        <span className="chapter-chip">{level.chapter}</span>
        <h2>{level.title}</h2>
        <p className="challenge-prompt">{level.prompt}</p>

        <div className="score-grid">
          <div className="score-box">
            <span>Best score</span>
            <strong>{bestPoints} pts</strong>
          </div>
          <div className="score-box">
            <span>Gates used</span>
            <strong className={currentMinimal ? "is-optimal" : "is-over"}>
              {currentUsedComponents} / {level.minimumComponents}
            </strong>
          </div>
        </div>

        <div className="challenge-actions">
          <button className="cyber-button primary" type="button" onClick={onRunTests}>
            <UiIcon name="play" />
            Run tests
          </button>
          <button className="cyber-button secondary" type="button" onClick={onReset}>
            <UiIcon name="reset" />
            Reset
          </button>
        </div>

        <button className="cyber-button success wide" disabled={!canGoNext} type="button" onClick={onNext}>
          Next level
          <UiIcon name="arrow" />
        </button>

        <div className={`status-card ${solved ? "is-success" : ""}`}>
          <UiIcon name={solved ? "check" : "wave"} />
          <span>{statusMessage}</span>
        </div>
      </section>

      <section className="cyber-panel signal-panel">
        <div className="panel-title-line">
          <UiIcon name="wave" />
          <span>Live Signals</span>
        </div>
        {visibleIssues.length === 0 ? (
          <div className="signal-status is-settled">
            <span className="signal-dot" />
            <span>The current circuit has settled.</span>
            <UiIcon name="wave" />
          </div>
        ) : (
          <div className="issue-stack">
            {visibleIssues.map((issue, index) => (
              <div className="signal-status is-warning" key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`}>
                <span>{issue.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="cyber-panel tests-panel">
        <div className="panel-title-line">
          <span>Truth Table Tests</span>
          {testRun && (
            <span className={`test-count ${testRun.passed ? "is-pass" : "is-fail"}`}>
              {testRun.passedCount}/{testRun.total}
            </span>
          )}
        </div>

        <div className="truth-table-wrap">
          <table className="truth-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Input</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {level.tests.map((testCase) => {
                const result = testRun?.cases.find((caseResult) => caseResult.testCase.name === testCase.name);
                return (
                  <tr key={testCase.name}>
                    <td>{testCase.name}</td>
                    <td>{renderBits(testCase.inputs)}</td>
                    <td>{renderBits(testCase.outputs)}</td>
                    <td>
                      {result
                        ? Object.entries(result.actual)
                            .map(([key, value]) => `${key}=${value ?? "?"}`)
                            .join("  ")
                        : "-"}
                    </td>
                    <td>
                      <span className={`test-result ${result ? (result.passed ? "is-pass" : "is-fail") : ""}`}>
                        {result ? (result.passed ? "Pass" : "Fail") : "Not Run"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {testRun && !testRun.passed && (
          <div className="issue-stack">
            {testRun.cases
              .filter((caseResult) => !caseResult.passed)
              .slice(0, 3)
              .map((caseResult) => (
                <div className="signal-status is-error" key={caseResult.testCase.name}>
                  {caseResult.testCase.name}: {caseResult.messages.join(" ")}
                </div>
              ))}
          </div>
        )}
      </section>

      <details className="cyber-panel hints-panel">
        <summary>
          <span>
            <UiIcon name="spark" />
            Hints
          </span>
          <span className="summary-chevron">v</span>
        </summary>
        <div className="hint-list">
          {level.hints.map((hint) => (
            <p key={hint}>{hint}</p>
          ))}
        </div>
      </details>
    </div>
  );
}
