import type { ChartDefinition } from "@/src/core/charts/chart-definition";
import { areaDefinition } from "@/src/core/charts/definitions/area";
import { barDefinition } from "@/src/core/charts/definitions/bar";
import { histogramDefinition } from "@/src/core/charts/definitions/histogram";
import { lineDefinition } from "@/src/core/charts/definitions/line";
import { pieDefinition } from "@/src/core/charts/definitions/pie";
import { scatterDefinition } from "@/src/core/charts/definitions/scatter";

// Explicit registration keeps additions and removals visible to maintainers.
export const chartCatalog: ChartDefinition[] = [
  lineDefinition,
  barDefinition,
  scatterDefinition,
  histogramDefinition,
  areaDefinition,
  pieDefinition,
];
