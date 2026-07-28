import { chartCatalog } from "@/src/core/charts/catalog";
import type { DataProfile } from "@/src/core/data/types";
import type {
  Recommendation,
  VisualizationIntent,
} from "@/src/core/viz-spec/schema";

export function recommendCharts(
  profile: DataProfile,
  intent: VisualizationIntent,
): Recommendation[] {
  return chartCatalog
    .map((definition) => definition.recommend({ profile, intent }))
    .filter((item): item is Recommendation => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
