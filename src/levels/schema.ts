import { z } from "zod";

const signalValueSchema = z.number().int().nonnegative();
const gateKindSchema = z.enum([
  "const0",
  "const1",
  "not",
  "and",
  "or",
  "xor",
  "halfAdder",
  "fullAdder",
  "adder2",
  "adder4",
  "bus4",
  "splitter",
  "joiner",
  "comparator",
  "incrementer",
  "subtractor",
]);
const ioKindSchema = z.enum(["input", "output"]);

export const levelSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  chapter: z.string().min(1),
  prompt: z.string().min(1),
  allowedComponents: z.array(gateKindSchema),
  minimumComponents: z.number().int().nonnegative(),
  givens: z.array(
    z.object({
      id: z.string().min(1),
      kind: ioKindSchema,
      label: z.string().min(1),
      width: z.number().int().positive().optional(),
      position: z.object({ x: z.number(), y: z.number() }),
    }),
  ),
  tests: z.array(
    z.object({
      name: z.string().min(1),
      inputs: z.record(z.string(), signalValueSchema),
      outputs: z.record(z.string(), signalValueSchema),
    }),
  ),
  unlocks: z.array(gateKindSchema),
  hints: z.array(z.string()),
  successMessage: z.string().min(1),
});

export const levelsSchema = z.array(levelSchema);
