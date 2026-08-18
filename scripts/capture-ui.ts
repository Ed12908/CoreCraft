import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { type Browser, chromium } from "@playwright/test";

const url = process.env.UI_URL ?? "http://127.0.0.1:5175/";
const outputPath = resolve(process.cwd(), process.env.UI_SCREENSHOT ?? "screenshots/current.png");
const browserCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
].filter(Boolean) as string[];

const executablePath = browserCandidates.find((candidate) => existsSync(candidate));

const points = {
  points: 150,
  maxPoints: 150,
  usedComponents: 1,
  minimumComponents: 1,
  minimal: true,
  awardedAt: "2026-05-11T00:00:00.000Z",
};

const xorCircuit = {
  nodes: [
    {
      id: "input-a",
      type: "component",
      position: { x: 60, y: -40 },
      deletable: false,
      data: { kind: "input", label: "A", fixed: true, value: 1 },
    },
    {
      id: "input-b",
      type: "component",
      position: { x: 60, y: 190 },
      deletable: false,
      data: { kind: "input", label: "B", fixed: true, value: 0 },
    },
    {
      id: "xor-and-top",
      type: "component",
      position: { x: 295, y: -80 },
      data: { kind: "and", label: "AND" },
    },
    {
      id: "xor-not",
      type: "component",
      position: { x: 495, y: -145 },
      data: { kind: "not", label: "NOT" },
    },
    {
      id: "xor-or",
      type: "component",
      position: { x: 310, y: 225 },
      data: { kind: "or", label: "OR" },
    },
    {
      id: "xor-and-out",
      type: "component",
      position: { x: 580, y: 60 },
      data: { kind: "and", label: "AND" },
    },
    {
      id: "output-out",
      type: "component",
      position: { x: 770, y: 75 },
      deletable: false,
      data: { kind: "output", label: "OUT", fixed: true, value: 0 },
    },
  ],
  edges: [
    {
      id: "wire-a-and",
      source: "input-a",
      sourceHandle: "out:out",
      target: "xor-and-top",
      targetHandle: "in:a",
    },
    {
      id: "wire-b-and",
      source: "input-b",
      sourceHandle: "out:out",
      target: "xor-and-top",
      targetHandle: "in:b",
    },
    {
      id: "wire-and-not",
      source: "xor-and-top",
      sourceHandle: "out:out",
      target: "xor-not",
      targetHandle: "in:in",
    },
    {
      id: "wire-a-or",
      source: "input-a",
      sourceHandle: "out:out",
      target: "xor-or",
      targetHandle: "in:a",
    },
    {
      id: "wire-b-or",
      source: "input-b",
      sourceHandle: "out:out",
      target: "xor-or",
      targetHandle: "in:b",
    },
    {
      id: "wire-not-out",
      source: "xor-not",
      sourceHandle: "out:out",
      target: "xor-and-out",
      targetHandle: "in:a",
    },
    {
      id: "wire-or-out",
      source: "xor-or",
      sourceHandle: "out:out",
      target: "xor-and-out",
      targetHandle: "in:b",
    },
    {
      id: "wire-out-lamp",
      source: "xor-and-out",
      sourceHandle: "out:out",
      target: "output-out",
      targetHandle: "in:in",
    },
  ],
  updatedAt: "2026-05-11T00:00:00.000Z",
};

const persistedProgress = {
  state: {
    currentLevelIndex: 4,
    solvedLevelIds: ["wire-switch-lamp", "not-gate", "and-gate", "or-gate", "xor-from-basics", "half-adder"],
    unlockedComponents: ["not", "and", "or", "xor"],
    levelScores: {
      "wire-switch-lamp": { ...points, usedComponents: 0, minimumComponents: 0 },
      "not-gate": points,
      "and-gate": points,
      "or-gate": points,
      "xor-from-basics": { ...points, usedComponents: 4, minimumComponents: 4 },
      "half-adder": { ...points, usedComponents: 2, minimumComponents: 2 },
    },
    circuits: {
      "xor-from-basics": xorCircuit,
    },
  },
  version: 1,
};

mkdirSync(dirname(outputPath), { recursive: true });

const browser: Browser = await chromium.launch({
  executablePath,
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 1536, height: 1024 },
  deviceScaleFactor: 1,
});

await page.addInitScript((progress) => {
  localStorage.setItem("microcpu-builder-progress", JSON.stringify(progress));
}, persistedProgress);

await page.goto(url);
await page.waitForLoadState("networkidle");
await page.locator(".app-shell").waitFor({ state: "visible" });
await page.screenshot({ path: outputPath, fullPage: false });
await browser.close();

console.log(`Captured ${outputPath}`);
