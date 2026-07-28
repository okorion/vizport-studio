import type { DataProfile, FieldKind, FieldProfile } from "@/src/core/data/types";
import type {
  ChartType,
  Recommendation,
  VisualizationIntent,
  VizSpec,
} from "@/src/core/viz-spec/schema";

export interface ChartContext {
  profile: DataProfile;
  intent: VisualizationIntent;
}

export interface ChartDefinition {
  id: ChartType;
  label: string;
  recommend(context: ChartContext): Recommendation | null;
}

export function firstField(
  profile: DataProfile,
  kind: FieldKind,
  excludedKeys: string[] = [],
): FieldProfile | undefined {
  return profile.fields.find(
    (field) => field.kind === kind && !excludedKeys.includes(field.key),
  );
}

export function makeRecommendation(
  definition: Pick<ChartDefinition, "id" | "label">,
  score: number,
  reason: string,
  spec: Omit<VizSpec, "version" | "chartType">,
  caution?: string,
): Recommendation {
  return {
    id: `${definition.id}-${spec.encoding.x}-${spec.encoding.y ?? "count"}`,
    label: definition.label,
    score: Math.min(99, Math.max(1, Math.round(score))),
    reason,
    caution,
    spec: {
      version: 1,
      chartType: definition.id,
      ...spec,
    },
  };
}

export function intentBonus(
  intent: VisualizationIntent,
  preferred: VisualizationIntent,
): number {
  return intent === preferred ? 16 : intent === "auto" ? 6 : -8;
}
