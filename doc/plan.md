# CoreCraft

This is a browser-first learning game, not a full HDL simulator.
The best shape is a **mission-based circuit sandbox**: each level gives a goal, limited
parts, a workbench, and tests.
When the player proves a circuit works, that circuit can become a reusable part in later
levels.

## Recommended direction

Build the game around three layers:

1. **Puzzle layer**: levels, unlocks, scoring, hints, saved progress.
2. **Circuit editor layer**: drag components, connect ports, inspect signals.
3. **Simulator layer**: deterministic logic engine that checks truth tables, clock
   traces, and eventually CPU programs.

Use React for UI, TypeScript for the circuit model, DaisyUI for interface components,
and React Flow for the node canvas.
React Flow is a good fit because it already handles nodes, edges, dragging, zooming,
panning, selection, custom nodes, and custom edges.
Its docs also show how to create custom node UIs and type them in TypeScript.
([React Flow][1])

For external drag-and-drop from a component library into the canvas, React Flow’s docs
recommend a custom sidebar and note that this behavior is separate from the flow pane
itself. For touch support, prefer Pointer Events over plain HTML drag-and-drop.
([React Flow][2])

## Current stack

Use:

```bash
npm create vite@latest corecraft -- --template react-ts
cd corecraft

npm install @xyflow/react zustand zod
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest

npm install -D vitest @testing-library/react @testing-library/jest-dom
npm init playwright@latest
```

DaisyUI’s current Vite docs show version **5.5.19** and the Tailwind 4 style setup:
install `tailwindcss@latest`, `@tailwindcss/vite@latest`, and `daisyui@latest`, then add
`@import "tailwindcss";` and `@plugin "daisyui";` in CSS. ([daisyUI][3])

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`src/index.css`:

```css
@import "tailwindcss";
@plugin "daisyui";
```

Vite is a natural base for a React/TS app, and its docs still recommend
`npm create vite@latest` for project creation.
([vitejs][4]) Vitest fits well for the simulator because it reuses Vite’s config and
supports ESM, TypeScript, and JSX out of the box.
([Vitest][5]) Playwright is useful later for end-to-end tests across Chromium, Firefox,
and WebKit.
([Playwright][6]) Zod is useful for validating level files and saved circuits
because it is TypeScript-first and supports schema validation with type inference.
([Zod][7])

## Game progression

### Chapter 1: Signals and gates

Goal: teach that wires carry `0` or `1`.

Levels:

1. Connect switch to lamp.
2. Use NOT to invert a signal.
3. Use AND for “both switches must be on.”
4. Use OR for “either switch turns on lamp.”
5. Build NAND and NOR from primitives.
6. Build XOR from NOT, AND, OR.

Unlocks:

```txt
Switch, Lamp
NOT
AND
OR
NAND
NOR
XOR
```

### Chapter 2: Adders

Goal: show that arithmetic is just logic.

Levels:

1. Build half adder.
2. Build full adder from two half adders.
3. Build 2-bit ripple-carry adder.
4. Build 4-bit ripple-carry adder.
5. Add carry-out lamp.
6. Add overflow challenge.

Unlocks:

```txt
HalfAdder
FullAdder
2BitAdder
4BitAdder
```

### Chapter 3: Buses and reusable parts

Goal: move from single wires to 4-bit buses.

Levels:

1. Use a 4-bit input block.
2. Split a bus into bits.
3. Join bits into a bus.
4. Compare two 4-bit numbers.
5. Make a 4-bit incrementer.
6. Make two’s-complement negation.
7. Build subtractor from adder plus inversion.

Unlocks:

```txt
Bus4
Splitter
Joiner
Incrementer
Subtractor
Comparator
```

### Chapter 4: Selection and control

Goal: introduce control signals.

Levels:

1. Build 2:1 mux.
2. Build 4:1 mux.
3. Build decoder.
4. Route one input to many outputs.
5. Select ALU operation using control bits.

Unlocks:

```txt
Mux2
Mux4
Decoder
Demux
ControlBit
```

### Chapter 5: Memory and clocking

Goal: introduce state without jumping into analog details.

Start with idealized clocked components.
Avoid latches until the player already understands stable state.

Levels:

1. D flip-flop.
2. 4-bit register.
3. Register with enable.
4. Register with reset.
5. Program counter.
6. Program counter with load and increment.
7. Small RAM block.
8. ROM block.

Unlocks:

```txt
Clock
DFlipFlop
Register4
ProgramCounter
RAM16x4
ROM16x8
```

### Chapter 6: ALU

Goal: build the processor’s data path.

Suggested ALU operations:

```txt
000: PASS A
001: ADD
010: SUB
011: AND
100: OR
101: XOR
110: NOT A
111: INC A
```

Outputs:

```txt
Result[3:0]
Zero
Carry
Negative
Overflow, optional
```

Levels:

1. ALU with ADD only.
2. Add SUB.
3. Add logic operations.
4. Add operation select.
5. Add flags.
6. Pass randomized ALU test suite.

Unlocks:

```txt
ALU4
FlagUnit
```

### Chapter 7: Final 4-bit microprocessor

Goal: assemble a real clocked machine.

A good final CPU target:

```txt
4-bit data bus
4-bit accumulator
4-bit B register
4-bit ALU
4-bit program counter
8-bit instruction ROM
16 x 4-bit data RAM
instruction register
control decoder
output register
```

A simple 8-bit instruction format works well:

```txt
high nibble: opcode
low nibble: immediate value or address
```

Example ISA:

```txt
0x0: NOP
0x1: LDI imm4
0x2: LDA addr4
0x3: STA addr4
0x4: ADD addr4
0x5: SUB addr4
0x6: AND addr4
0x7: OR addr4
0x8: XOR addr4
0x9: JMP addr4
0xA: JZ addr4
0xB: JC addr4
0xC: OUT
0xD: INC
0xE: DEC
0xF: HALT
```

Final tests:

```txt
Load immediate and output
Add two RAM values
Subtract until zero
Conditional jump
Counter program
Tiny Fibonacci-like sequence modulo 16
```

## Level format

Define levels as data, not hardcoded React screens.

```ts
export type LevelId = string;
export type ComponentKind =
  | "switch"
  | "lamp"
  | "not"
  | "and"
  | "or"
  | "xor"
  | "halfAdder"
  | "fullAdder"
  | "adder4"
  | "mux2"
  | "register4"
  | "alu4";

export type Level = {
  id: LevelId;
  title: string;
  chapter: string;
  prompt: string;
  allowedComponents: ComponentKind[];
  givens?: CircuitNode[];
  tests: LevelTest[];
  unlocks: ComponentKind[];
  hints: string[];
};

export type LevelTest =
  | {
      type: "truthTable";
      inputs: string[];
      outputs: string[];
      cases: Array<{
        in: Record<string, 0 | 1>;
        out: Record<string, 0 | 1>;
      }>;
    }
  | {
      type: "busTruthTable";
      cases: Array<{
        in: Record<string, number>;
        out: Record<string, number>;
      }>;
    }
  | {
      type: "clockTrace";
      steps: Array<{
        inputs: Record<string, number>;
        tick?: boolean;
        expect: Record<string, number>;
      }>;
    }
  | {
      type: "program";
      rom: number[];
      maxTicks: number;
      expect: {
        registers?: Record<string, number>;
        ram?: Record<number, number>;
        output?: number[];
      };
    };
```

Example level:

```ts
export const halfAdderLevel: Level = {
  id: "half-adder",
  title: "Half Adder",
  chapter: "Adders",
  prompt: "Build a circuit that adds two 1-bit inputs. Output Sum and Carry.",
  allowedComponents: ["switch", "lamp", "not", "and", "or", "xor"],
  tests: [
    {
      type: "truthTable",
      inputs: ["A", "B"],
      outputs: ["SUM", "CARRY"],
      cases: [
        { in: { A: 0, B: 0 }, out: { SUM: 0, CARRY: 0 } },
        { in: { A: 0, B: 1 }, out: { SUM: 1, CARRY: 0 } },
        { in: { A: 1, B: 0 }, out: { SUM: 1, CARRY: 0 } },
        { in: { A: 1, B: 1 }, out: { SUM: 0, CARRY: 1 } },
      ],
    },
  ],
  unlocks: ["halfAdder"],
  hints: [
    "Carry is only on when both inputs are on.",
    "Sum is on when exactly one input is on.",
  ],
};
```

## Circuit model

Keep React Flow’s visual graph separate from the simulator’s netlist.

```ts
export type Bit = 0 | 1;
export type BusValue = Bit[];

export type PortDirection = "in" | "out";

export type PortSpec = {
  id: string;
  label: string;
  direction: PortDirection;
  width: number;
};

export type ComponentDef = {
  kind: string;
  label: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  eval?: (inputs: Record<string, BusValue>) => Record<string, BusValue>;
};

export type CircuitNode = {
  id: string;
  kind: string;
  position: { x: number; y: number };
  params?: Record<string, unknown>;
};

export type Wire = {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
};

export type CircuitGraph = {
  nodes: CircuitNode[];
  wires: Wire[];
};
```

Primitive gates:

```ts
const bit = (v: BusValue): Bit => v[0] ?? 0;

export const primitives: Record<string, ComponentDef> = {
  not: {
    kind: "not",
    label: "NOT",
    inputs: [{ id: "in", label: "In", direction: "in", width: 1 }],
    outputs: [{ id: "out", label: "Out", direction: "out", width: 1 }],
    eval: ({ in: input }) => ({
      out: [bit(input) ? 0 : 1],
    }),
  },

  and: {
    kind: "and",
    label: "AND",
    inputs: [
      { id: "a", label: "A", direction: "in", width: 1 },
      { id: "b", label: "B", direction: "in", width: 1 },
    ],
    outputs: [{ id: "out", label: "Out", direction: "out", width: 1 }],
    eval: ({ a, b }) => ({
      out: [bit(a) & bit(b) ? 1 : 0],
    }),
  },

  xor: {
    kind: "xor",
    label: "XOR",
    inputs: [
      { id: "a", label: "A", direction: "in", width: 1 },
      { id: "b", label: "B", direction: "in", width: 1 },
    ],
    outputs: [{ id: "out", label: "Out", direction: "out", width: 1 }],
    eval: ({ a, b }) => ({
      out: [bit(a) === bit(b) ? 0 : 1],
    }),
  },
};
```

## Simulation rules

Use a clean digital model:

1. **Combinational mode** Evaluate acyclic circuits by topological order.
   Reject illegal feedback unless it passes through a state component.

2. **Clocked mode** Split each tick into:

   * read current register values
   * compute next values
   * commit register values on clock edge
   * recompute outputs

3. **Bus mode** Treat a bus as `Bit[]`. Each port has a fixed width.
   Reject mismatched widths unless the player uses a splitter, joiner, constant, or
   adapter.

4. **Macro mode** When a player completes a circuit, save it as a macro.
   A macro is just a subgraph with named inputs and outputs.
   The simulator compiles it exactly like primitives.

## Validation strategy

For early levels, run exhaustive truth tables.

For a half adder:

```txt
4 cases
```

For a full adder:

```txt
8 cases
```

For a 4-bit adder:

```txt
A: 0..15
B: 0..15
Cin: 0..1
512 cases
```

For CPU levels, run instruction traces:

```ts
{
  type: "program",
  rom: [
    0x15, // LDI 5
    0xC0, // OUT
    0xF0, // HALT
  ],
  maxTicks: 20,
  expect: {
    output: [5],
    registers: { ACC: 5 },
  },
}
```

## UI structure

Use DaisyUI for the shell and React Flow for the workbench.

```txt
Top bar
  Level name
  Progress
  Run tests
  Reset
  Hints

Left drawer
  Component library
  Locked components
  Search/filter later

Center
  Circuit canvas
  Signal values on wires
  Zoom controls
  Minimap later

Right panel
  Selected component inspector
  Truth table/test results
  Explanation
  Failure message

Bottom panel
  Clock controls
  Step
  Run
  Pause
  Tick count
```

Good DaisyUI components for this:

```txt
drawer
navbar
card
btn
badge
steps
progress
modal
toast
alert
tabs
collapse
```

## State split

Keep state in three buckets:

```txt
React Flow state:
  nodes
  edges
  viewport

Game state:
  current level
  unlocked components
  solved levels
  saved circuits

Simulation state:
  signal values
  register values
  test results
  tick count
```

Zustand is reasonable for game state and simulator state.
React Flow can manage nodes and edges internally at first, or you can control them once
save/load becomes important.

## Suggested folder structure

```txt
src/
  app/
    App.tsx
    routes.tsx
    index.css

  features/
    circuit/
      canvas/
        CircuitCanvas.tsx
        ComponentNode.tsx
        SignalEdge.tsx
        LibraryPanel.tsx
        InspectorPanel.tsx

      engine/
        types.ts
        primitives.ts
        compileGraph.ts
        simulateCombinational.ts
        simulateClocked.ts
        runLevelTests.ts
        macros.ts

      levels/
        schema.ts
        chapter01-gates.ts
        chapter02-adders.ts
        chapter03-buses.ts
        chapter04-control.ts
        chapter05-memory.ts
        chapter06-alu.ts
        chapter07-cpu.ts

    game/
      progressStore.ts
      LevelScreen.tsx
      ResultsPanel.tsx
      HintPanel.tsx

  shared/
    ui/
    ids.ts
    storage.ts
```

## MVP build order

### Milestone 1: First playable prototype

Build:

```txt
canvas
component library
switch, lamp, NOT, AND, OR
wire creation
run truth-table tests
3 to 5 levels
local progress save
```

Skip:

```txt
buses
clock
registers
CPU
animations beyond showing wire values
```

### Milestone 2: Adders and macros

Build:

```txt
XOR
half adder
full adder
4-bit adder
macro unlocks
truth-table autograder
```

This is the first point where the game starts feeling like it is “building up” rather
than just solving isolated puzzles.

### Milestone 3: Buses and ALU

Build:

```txt
4-bit input
4-bit output
splitter
joiner
mux
decoder
ALU
flags
```

### Milestone 4: Clocked circuits

Build:

```txt
clock
D flip-flop
register
program counter
RAM
ROM
step/run controls
clock trace tests
```

### Milestone 5: Microprocessor

Build:

```txt
instruction register
control decoder
fetch/decode/execute loop
simple ISA
program tests
final free-build level
```

## The main technical risk

The hard part is not the UI. The hard part is the simulator staying understandable.

Set these rules early:

```txt
No arbitrary analog behavior.
No timing races.
No unknown X/Z values at first.
No feedback loops unless they pass through a clocked component.
All ports have fixed widths.
All level tests are deterministic.
```

Later, you can add advanced concepts like tri-state buses, propagation delay, hazards,
and latches as optional expert levels.

## Best first target

Build the first vertical slice around this sequence:

```txt
Level 1: switch to lamp
Level 2: NOT gate
Level 3: AND gate
Level 4: OR gate
Level 5: XOR challenge
Level 6: half adder
```

That slice proves the core product: dragging parts, wiring, simulating, testing,
unlocking, and teaching.
Once that feels good, the path to a 4-bit microprocessor is mostly level content plus a
stronger simulator.

[1]: https://reactflow.dev/ "Node-Based UIs in React - React Flow"
[2]: https://reactflow.dev/examples/interaction/drag-and-drop "Drag and Drop - React Flow"
[3]: https://daisyui.com/docs/install/vite/ "Install daisyUI for Vite — daisyUI Tailwind CSS Component UI Library"
[4]: https://vite.dev/ "Vite | Next Generation Frontend Tooling"
[5]: https://vitest.dev/ "Vitest | Next Generation testing framework"
[6]: https://playwright.dev/docs/intro "Installation | Playwright"
[7]: https://zod.dev/ "Intro | Zod"
