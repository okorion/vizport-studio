import { describe, expect, it } from "vitest";
import type { VizSpec } from "@/src/core/viz-spec/schema";
import {
  buildInstallCommand,
  buildReactEChartsSource,
} from "@/src/integrations/exporters/reactEcharts";

const histogramSpec: VizSpec = {
  version: 1,
  chartType: "histogram",
  title: "Revenue distribution",
  description: "Revenue frequency by range",
  intent: "distribution",
  encoding: { x: "revenue" },
  aggregate: "count",
  options: { smooth: false, stacked: false, showLegend: false },
  renderer: { preferred: "auto" },
};

describe("React ECharts exporter", () => {
  it("includes only the extra histogram dependency when required", () => {
    const source = buildReactEChartsSource(histogramSpec);

    expect(buildInstallCommand(histogramSpec)).toBe("npm install echarts d3-array");
    expect(source).toContain('import { bin as d3Bin } from "d3-array"');
    expect(source).toContain("ResizeObserver");
    expect(source).toContain("chart.dispose()");
  });
});
