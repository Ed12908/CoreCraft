import { z } from "zod";

const bitSchema = z.union([z.literal(0), z.literal(1)]);
const gateKindSchema = z.enum(["not", "and", "or", "xor"]);
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
      position: z.object({ x: z.number(), y: z.number() }),
    }),
  ),
  tests: z.array(
    z.object({
      name: z.string().min(1),
      inputs: z.record(z.string(), bitSchema),
      outputs: z.record(z.string(), bitSchema),
    }),
  ),
  unlocks: z.array(gateKindSchema),
  hints: z.array(z.string()),
  successMessage: z.string().min(1),
});

export const levelsSchema = z.array(levelSchema);
