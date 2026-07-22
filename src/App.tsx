import { type EdgeChange, type NodeChange, useEdgesState, useNodesState } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/CircuitCanvas";
import { InspectorPanel } from "./components/InspectorPanel";
import { LevelNavigator } from "./components/LevelNavigator";
import { LibraryPanel } from "./components/LibraryPanel";
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
    <div className="flex h-screen flex-col bg-base-300 text-base-content">
      <header className="navbar border-b border-base-300 bg-base-100 px-4">
        <div className="flex-1 gap-3">
          <div>
            <div className="text-lg font-bold">MicroCPU Builder</div>
            <div className="text-xs opacity-65">Logic gates to a 4-bit processor</div>
          </div>
          <div className="hidden min-w-56 md:block">
            <progress className="progress progress-primary w-full" max="100" value={progressPercent} />
            <div className="text-xs opacity-65">
              {solvedLevelIds.length}/{levels.length} levels solved · {totalPoints}/{maxPoints} pts
            </div>
          </div>
        </div>
        <div className="flex-none gap-2">
          <span className="badge badge-primary">{totalPoints} pts</span>
          <span className="badge badge-outline">Level {currentLevelIndex + 1}</span>
          <button className="btn btn-sm btn-ghost" type="button" onClick={resetEverything}>
            Clear progress
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_420px] gap-3 p-3">
        <aside className="min-h-0 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-4">
          <div className="space-y-6">
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
          </div>
        </aside>

        <section className="min-h-0">
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

        <aside className="min-h-0 rounded-box border border-base-300 bg-base-200 p-3">
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
