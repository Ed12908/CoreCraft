import { type EdgeChange, type NodeChange, useEdgesState, useNodesState } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/CircuitCanvas";
import { InspectorPanel } from "./components/InspectorPanel";
import { LevelNavigator } from "./components/LevelNavigator";
import { LibraryPanel } from "./components/LibraryPanel";
import { UiIcon } from "./components/UiIcons";
import { createGateNode, createGivenNode } from "./engine/nodeFactory";
import { runLevelTests, type TestRunResult } from "./engine/runLevelTests";
import { countPlacedComponents, maxPointsForLevel, scoreCircuit } from "./engine/scoring";
import { simulateCircuit } from "./engine/simulator";
import type { CircuitEdge, CircuitNode, GateKind } from "./engine/types";
import { levels } from "./levels/levels";
import { useProgressStore } from "./store/progressStore";

function createLevelNodes(levelIndex: number): CircuitNode[] {
  return levels[levelIndex].givens.map(createGivenNode);
}

function App() {
  const persistedLevelIndex = useProgressStore((state) => state.currentLevelIndex);
  const setCurrentLevelIndex = useProgressStore((state) => state.setCurrentLevelIndex);
  const solvedLevelIds = useProgressStore((state) => state.solvedLevelIds);
  const unlockedComponents = useProgressStore((state) => state.unlockedComponents);
  const levelScores = useProgressStore((state) => state.levelScores ?? {});
  const markSolved = useProgressStore((state) => state.markSolved);
  const saveCircuit = useProgressStore((state) => state.saveCircuit);
  const clearCircuit = useProgressStore((state) => state.clearCircuit);
  const clearAllProgress = useProgressStore((state) => state.clearAllProgress);
  const circuits = useProgressStore((state) => state.circuits);

  const currentLevelIndex = Math.min(Math.max(persistedLevelIndex, 0), levels.length - 1);
  const level = levels[currentLevelIndex];
  const solved = solvedLevelIds.includes(level.id);
  const levelScore = levelScores[level.id];

  const initialCircuit = circuits[level.id];
  const [nodes, setNodes, onNodesChange] = useNodesState<CircuitNode>(
    initialCircuit?.nodes ?? createLevelNodes(currentLevelIndex),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<CircuitEdge>(initialCircuit?.edges ?? []);
  const [circuitLevelId, setCircuitLevelId] = useState(level.id);
  const [testRun, setTestRun] = useState<TestRunResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Connect the circuit, then run tests.");

  useEffect(() => {
    if (persistedLevelIndex !== currentLevelIndex) {
      setCurrentLevelIndex(currentLevelIndex);
    }
  }, [currentLevelIndex, persistedLevelIndex, setCurrentLevelIndex]);

  useEffect(() => {
    const saved = useProgressStore.getState().circuits[level.id];
    setNodes(saved?.nodes ?? createLevelNodes(currentLevelIndex));
    setEdges(saved?.edges ?? []);
    setCircuitLevelId(level.id);
    setTestRun(null);
    setStatusMessage(solved ? level.successMessage : "Connect the circuit, then run tests.");
  }, [currentLevelIndex, level.id, level.successMessage, setEdges, setNodes, solved]);

  useEffect(() => {
    for (const solvedLevelId of solvedLevelIds) {
      const solvedLevel = levels.find((candidate) => candidate.id === solvedLevelId);
      if (!solvedLevel || levelScores[solvedLevel.id]) continue;

      const saved = circuits[solvedLevel.id];
      if (!saved) continue;

      const result = runLevelTests(solvedLevel, saved.nodes, saved.edges);
      if (result.passed) {
        markSolved(solvedLevel.id, solvedLevel.unlocks, scoreCircuit(solvedLevel, saved.nodes));
      }
    }
  }, [circuits, levelScores, markSolved, solvedLevelIds]);

  useEffect(() => {
    if (circuitLevelId !== level.id) return;
    saveCircuit(level.id, nodes, edges);
  }, [circuitLevelId, edges, level.id, nodes, saveCircuit]);

  const simulation = useMemo(() => simulateCircuit(nodes, edges), [nodes, edges]);
  const currentUsedComponents = useMemo(() => countPlacedComponents(nodes), [nodes]);

  const toggleInput = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== nodeId || node.data.kind !== "input") return node;
          return {
            ...node,
            data: {
              ...node.data,
              value: node.data.value === 1 ? 0 : 1,
            },
          };
        }),
      );
    },
    [setNodes],
  );

  const addComponent = useCallback(
    (kind: GateKind) => {
      if (!level.allowedComponents.includes(kind)) return;
      const offset = nodes.filter((node) => node.data.kind === kind).length * 24;
      setNodes((currentNodes) => [...currentNodes, createGateNode(kind, { x: 320 + offset, y: 150 + offset })]);
      setStatusMessage(`${kind.toUpperCase()} gate added.`);
    },
    [level.allowedComponents, nodes, setNodes],
  );

  const resetCircuit = useCallback(() => {
    clearCircuit(level.id);
    setNodes(createLevelNodes(currentLevelIndex));
    setEdges([]);
    setTestRun(null);
    setStatusMessage("Circuit reset.");
  }, [clearCircuit, currentLevelIndex, level.id, setEdges, setNodes]);

  const runTests = useCallback(() => {
    const result = runLevelTests(level, nodes, edges);
    setTestRun(result);

    if (result.passed) {
      const score = scoreCircuit(level, nodes);
      markSolved(level.id, level.unlocks, score);
      setStatusMessage(
        score.minimal
          ? `${level.successMessage} Minimal solution: ${score.points}/${score.maxPoints} points.`
          : `${level.successMessage} This run scores ${score.points}/${score.maxPoints} points. Use ${score.minimumComponents} or fewer gates for the minimal bonus.`,
      );
    } else {
      setStatusMessage(`Tests failed: ${result.passedCount}/${result.total} cases passed.`);
    }
  }, [edges, level, markSolved, nodes]);

  const goNext = useCallback(() => {
    if (currentLevelIndex < levels.length - 1 && solvedLevelIds.includes(level.id)) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  }, [currentLevelIndex, level.id, setCurrentLevelIndex, solvedLevelIds]);

  const selectLevel = useCallback(
    (index: number) => {
      const locked = index > 0 && !solvedLevelIds.includes(levels[index - 1].id);
      if (!locked) setCurrentLevelIndex(index);
    },
    [setCurrentLevelIndex, solvedLevelIds],
  );

  const resetEverything = useCallback(() => {
    const confirmed = window.confirm("Clear solved levels and saved circuits?");
    if (!confirmed) return;
    clearAllProgress();
    setNodes(createLevelNodes(0));
    setEdges([]);
    setTestRun(null);
    setStatusMessage("Progress cleared.");
  }, [clearAllProgress, setEdges, setNodes]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<CircuitNode>[]) => {
      onNodesChange(changes);
      setTestRun(null);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<CircuitEdge>[]) => {
      onEdgesChange(changes);
      setTestRun(null);
    },
    [onEdgesChange],
  );

  const progressPercent = Math.round((solvedLevelIds.length / levels.length) * 100);
  const totalPoints = Object.values(levelScores).reduce((sum, score) => sum + score.points, 0);
  const maxPoints = levels.length * maxPointsForLevel();
  const canGoNext = solved && currentLevelIndex < levels.length - 1;

  return (
    <div className="app-shell">
      <header className="top-hud">
        <section className="hud-card brand-card" aria-label="Application">
          <div className="brand-chip">
            <UiIcon name="chip" />
          </div>
          <div>
            <h1>MicroCPU Builder</h1>
            <p>Logic gates to a 4-bit processor</p>
          </div>
        </section>

        <section className="hud-card progress-card" aria-label="Level progress">
          <div className="hud-label">Level Progress</div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-readout">
            <span>
              {solvedLevelIds.length} / {levels.length} levels solved
            </span>
            <span>
              {totalPoints} / {maxPoints} pts
            </span>
          </div>
        </section>

        <section className="hud-card score-card" aria-label="Score and actions">
          <div className="score-pill">
            <UiIcon name="xp" />
            <strong>{totalPoints}</strong>
            <span>pts</span>
          </div>
          <div className="level-chip">
            <span>Level</span>
            <strong>{currentLevelIndex + 1}</strong>
          </div>
          <button className="cyber-button ghost small" type="button" onClick={resetEverything}>
            <UiIcon name="refresh" />
            Clear progress
          </button>
        </section>
      </header>

      <main className="workbench">
        <aside className="left-rail">
          <LevelNavigator
            levels={levels}
            currentIndex={currentLevelIndex}
            solvedLevelIds={solvedLevelIds}
            levelScores={levelScores}
            onSelect={selectLevel}
          />
          <LibraryPanel
            allowedComponents={level.allowedComponents}
            unlockedComponents={unlockedComponents}
            onAddComponent={addComponent}
          />
        </aside>

        <section className="canvas-panel cyber-panel">
          <div className="panel-tab">Circuit Canvas</div>
          <CircuitCanvas
            nodes={nodes}
            edges={edges}
            simulation={simulation}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            toggleInput={toggleInput}
            onMessage={setStatusMessage}
          />
        </section>

        <aside className="right-rail">
          <InspectorPanel
            level={level}
            simulation={simulation}
            testRun={testRun}
            levelScore={levelScore}
            currentUsedComponents={currentUsedComponents}
            statusMessage={statusMessage}
            onRunTests={runTests}
            onReset={resetCircuit}
            onNext={goNext}
            canGoNext={canGoNext}
            solved={solved}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
