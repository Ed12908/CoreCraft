# CoreCraft

A first playable version of a level-based circuit game that grows toward a real 4-bit microprocessor.

## What is included

- Vite, React, TypeScript
- Tailwind CSS 4 and DaisyUI 5
- React Flow canvas with custom logic nodes
- Drag-and-drop component library
- Click-to-add component library fallback
- Switch/input and lamp/output nodes
- NOT, AND, OR, XOR gates
- Reusable half/full adders, 2-bit and 4-bit adders
- 4-bit buses, splitters, joiners, constants, comparator, incrementer, and subtractor components
- Eighteen levels from direct wiring through chapter 3 buses and reusable parts
- Level tests with automatic pass/fail checks
- Local progress and saved circuits with Zustand persist
- Deterministic combinational simulator
- Vitest coverage for simulator basics

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Game flow

1. Wire a switch to a lamp.
2. Use a NOT gate.
3. Build an AND circuit.
4. Build an OR circuit.
5. Build XOR from NOT, AND, and OR.
6. Build adders from half adder through 4-bit ripple carry and overflow.
7. Move to 4-bit buses with split, join, compare, increment, negate, and subtract missions.

The circuit editor keeps level input and output nodes fixed from deletion. User-added gates can be moved, wired, and deleted. Solved levels are saved locally.

## About

Made by Edouard Binsztok under the MIT license.
