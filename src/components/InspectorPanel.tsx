import type { TestRunResult } from "../engine/runLevelTests";
import { maxPointsForLevel } from "../engine/scoring";
import type { SimulationResult } from "../engine/simulator";
import type { Level, LevelScore } from "../engine/types";
import { CyberButton } from "./CyberButton";
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
  const inputKeys = Object.keys(level.tests[0]?.inputs ?? {});
  const outputKeys = Object.keys(level.tests[0]?.outputs ?? {});

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
          <CyberButton iconStart={<UiIcon name="play" />} variant="primary" onClick={onRunTests}>
            Run tests
          </CyberButton>
          <CyberButton iconStart={<UiIcon name="reset" />} variant="secondary" onClick={onReset}>
            Reset
          </CyberButton>
        </div>

        <CyberButton
          disabled={!canGoNext}
          iconEnd={<UiIcon name="arrow" />}
          size="lg"
          variant="success"
          wide
          onClick={onNext}
        >
          Next level
        </CyberButton>

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
                <th rowSpan={2} scope="col">
                  Case
                </th>
                <th colSpan={inputKeys.length} scope="colgroup">
                  Input
                </th>
                <th colSpan={outputKeys.length} scope="colgroup">
                  Expected
                </th>
                <th colSpan={outputKeys.length} scope="colgroup">
                  Actual
                </th>
                <th rowSpan={2} scope="col">
                  Result
                </th>
              </tr>
              <tr>
                {inputKeys.map((key) => (
                  <th key={`input-${key}`} scope="col">
                    {key}
                  </th>
                ))}
                {outputKeys.map((key) => (
                  <th key={`expected-${key}`} scope="col">
                    {key}
                  </th>
                ))}
                {outputKeys.map((key) => (
                  <th key={`actual-${key}`} scope="col">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {level.tests.map((testCase) => {
                const result = testRun?.cases.find((caseResult) => caseResult.testCase.name === testCase.name);
                return (
                  <tr key={testCase.name}>
                    <td>{testCase.name}</td>
                    {inputKeys.map((key) => (
                      <td key={`${testCase.name}-input-${key}`}>{testCase.inputs[key]}</td>
                    ))}
                    {outputKeys.map((key) => (
                      <td key={`${testCase.name}-expected-${key}`}>{testCase.outputs[key]}</td>
                    ))}
                    {outputKeys.map((key) => (
                      <td key={`${testCase.name}-actual-${key}`}>{result ? (result.actual[key] ?? "?") : "-"}</td>
                    ))}
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
