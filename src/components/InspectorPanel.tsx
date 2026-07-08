import type { Bit, Level } from "../engine/types";
import type { SimulationResult } from "../engine/simulator";
import type { TestRunResult } from "../engine/runLevelTests";

type InspectorPanelProps = {
  level: Level;
  simulation: SimulationResult;
  testRun: TestRunResult | null;
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
  statusMessage,
  onRunTests,
  onReset,
  onNext,
  canGoNext,
  solved,
}: InspectorPanelProps) {
  const visibleIssues = simulation.issues.slice(0, 4);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-3 p-4">
          <div>
            <div className="badge badge-outline">{level.chapter}</div>
            <h1 className="mt-2 text-xl font-bold">{level.title}</h1>
            <p className="mt-2 text-sm opacity-80">{level.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-primary" type="button" onClick={onRunTests}>
              Run tests
            </button>
            <button className="btn btn-outline" type="button" onClick={onReset}>
              Reset
            </button>
          </div>

          <button className="btn btn-success" disabled={!canGoNext} type="button" onClick={onNext}>
            Next level
          </button>

          <div className={`alert py-2 text-sm ${solved ? "alert-success" : ""}`}>
            <span>{statusMessage}</span>
          </div>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-3 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Live signals</h2>
          {visibleIssues.length === 0 ? (
            <div className="alert alert-success py-2 text-sm">
              <span>The current circuit has settled.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleIssues.map((issue, index) => (
                <div className="alert alert-warning py-2 text-xs" key={`${issue.code}-${issue.nodeId ?? issue.edgeId ?? index}`}>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Truth table tests</h2>
            {testRun && (
              <span className={`badge ${testRun.passed ? "badge-success" : "badge-warning"}`}>
                {testRun.passedCount}/{testRun.total}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Input</th>
                  <th>Expected</th>
                  <th>Actual</th>
                </tr>
              </thead>
              <tbody>
                {level.tests.map((testCase) => {
                  const result = testRun?.cases.find((caseResult) => caseResult.testCase.name === testCase.name);
                  return (
                    <tr key={testCase.name}>
                      <td>
                        <div className="flex items-center gap-1">
                          {result && (
                            <span className={`badge badge-xs ${result.passed ? "badge-success" : "badge-error"}`}>
                              {result.passed ? "ok" : "fail"}
                            </span>
                          )}
                          {testCase.name}
                        </div>
                      </td>
                      <td className="whitespace-pre">{renderBits(testCase.inputs)}</td>
                      <td className="whitespace-pre">{renderBits(testCase.outputs)}</td>
                      <td className="whitespace-pre">
                        {result
                          ? Object.entries(result.actual)
                              .map(([key, value]) => `${key}=${value ?? "?"}`)
                              .join("  ")
                          : "not run"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {testRun && !testRun.passed && (
            <div className="space-y-2">
              {testRun.cases
                .filter((caseResult) => !caseResult.passed)
                .slice(0, 3)
                .map((caseResult) => (
                  <div className="alert alert-error py-2 text-xs" key={caseResult.testCase.name}>
                    <span>
                      {caseResult.testCase.name}: {caseResult.messages.join(" ")}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="collapse collapse-arrow border border-base-300 bg-base-100">
        <input type="checkbox" />
        <div className="collapse-title text-sm font-semibold uppercase tracking-wide opacity-70">Hints</div>
        <div className="collapse-content space-y-2 text-sm opacity-80">
          {level.hints.map((hint) => (
            <p key={hint}>{hint}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
