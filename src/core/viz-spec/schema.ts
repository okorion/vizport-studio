import { z } from "zod";

export const chartTypeSchema = z.enum([
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "histogram",
]);

export const intentSchema = z.enum([
  "auto",
  "comparison",
  "trend",
  "distribution",
  "relationship",
  "composition",
]);

export const vizSpecSchema = z.object({
  version: z.literal(1),
  chartType: chartTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  intent: intentSchema,
  encoding: z.object({
    x: z.string().min(1),
    y: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
  }),
  aggregate: z.enum(["none", "sum", "average", "count"]),
  options: z.object({
    smooth: z.boolean(),
    stacked: z.boolean(),
    showLegend: z.boolean(),
  }),
  renderer: z.object({
    preferred: z.enum(["auto", "canvas", "webgpu"]),
  }),
});

export type ChartType = z.infer<typeof chartTypeSchema>;
export type VisualizationIntent = z.infer<typeof intentSchema>;
export type VizSpec = z.infer<typeof vizSpecSchema>;

export interface Recommendation {
  id: string;
  label: string;
  score: number;
  reason: string;
  aiReason?: string;
  caution?: string;
  spec: VizSpec;
}
