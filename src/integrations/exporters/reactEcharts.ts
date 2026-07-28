import type { DataRow } from "@/src/core/data/types";
import type { VizSpec } from "@/src/core/viz-spec/schema";

function sourceForSeries(spec: VizSpec): string {
  const x = JSON.stringify(spec.encoding.x);
  const y = JSON.stringify(spec.encoding.y ?? "");

  if (spec.chartType === "pie") {
    return `const grouped = new Map<string, number>();
  for (const row of data) {
    const key = String(row[${x}] ?? "(empty)");
    grouped.set(key, (grouped.get(key) ?? 0) + Number(row[${y}] ?? 0));
  }
  const option: echarts.EChartsOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [{
      type: "pie",
      radius: ["48%", "72%"],
      data: Array.from(grouped, ([name, value]) => ({ name, value })),
    }],
  };`;
  }

  if (spec.chartType === "histogram") {
    return `const values = data.map((row) => Number(row[${x}])).filter(Number.isFinite);
  const bins = d3Bin().thresholds(Math.min(16, Math.max(5, Math.ceil(Math.sqrt(values.length)))))(values);
  const option: echarts.EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 24, right: 24, top: 64, bottom: 28, containLabel: true },
    xAxis: { type: "category", data: bins.map((bin) => \`${"${bin.x0}"}–${"${bin.x1}"}\`) },
    yAxis: { type: "value", name: "Count" },
    series: [{ type: "bar", data: bins.map((bin) => bin.length), barWidth: "92%" }],
  };`;
  }

  const seriesType = spec.chartType === "area" ? "line" : spec.chartType;
  const axisType = spec.chartType === "scatter" ? "value" : "category";
  const seriesExtras =
    spec.chartType === "area"
      ? "areaStyle: { opacity: 0.18 }, smooth: true"
      : spec.chartType === "line"
        ? `smooth: ${spec.options.smooth}`
        : "";

  return `const option: echarts.EChartsOption = {
    dataset: { source: data },
    tooltip: { trigger: "${spec.chartType === "scatter" ? "item" : "axis"}" },
    grid: { left: 24, right: 24, top: 64, bottom: 28, containLabel: true },
    xAxis: { type: "${axisType}" },
    yAxis: { type: "value" },
    series: [{
      type: "${seriesType}",
      encode: { x: ${x}, y: ${y} },
      ${seriesExtras}
    }],
  };`;
}

export function buildReactEChartsSource(spec: VizSpec): string {
  const histogramImport =
    spec.chartType === "histogram" ? '\nimport { bin as d3Bin } from "d3-array";' : "";

  return `import { useEffect, useRef } from "react";
import * as echarts from "echarts";${histogramImport}

type ChartRow = Record<string, string | number | boolean | null>;

interface VizPortChartProps {
  data: ChartRow[];
  height?: number;
}

export function VizPortChart({ data, height = 360 }: VizPortChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    ${sourceForSeries(spec)}

    chart.setOption({
      title: { text: ${JSON.stringify(spec.title)} },
      color: ["#3157d5", "#7c5ce7", "#15a38b"],
      ...option,
    });

    const container = containerRef.current;
    let frame = 0;
    let previousWidth = Math.round(container.clientWidth);
    let previousHeight = Math.round(container.clientHeight);
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (!width || !height || (width === previousWidth && height === previousHeight)) return;
      previousWidth = width;
      previousHeight = height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => chart.resize({ width, height }));
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      chart.dispose();
    };
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%", height }} />;
}
`;
}

export function buildInstallCommand(spec: VizSpec): string {
  return spec.chartType === "histogram"
    ? "npm install echarts d3-array"
    : "npm install echarts";
}

export function buildSampleUsage(rows: DataRow[]): string {
  return `<VizPortChart data={${JSON.stringify(rows.slice(0, 4), null, 2)}} />`;
}
