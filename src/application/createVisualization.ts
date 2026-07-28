import { profileData } from "@/src/core/data-profile/profileData";
import type { DataRow } from "@/src/core/data/types";
import { recommendCharts } from "@/src/core/recommendations/recommendCharts";
import type { VisualizationIntent } from "@/src/core/viz-spec/schema";

export function createVisualization(
  rows: DataRow[],
  intent: VisualizationIntent,
) {
  const profile = profileData(rows);
  const recommendations = recommendCharts(profile, intent);

  return {
    profile,
    recommendations,
    selectedSpec: recommendations[0]?.spec ?? null,
  };
}
