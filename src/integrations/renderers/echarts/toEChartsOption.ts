import { bin, extent } from "d3-array";
import type { EChartsOption } from "echarts";
import type { DataRow, DataValue } from "@/src/core/data/types";
import type { VizSpec } from "@/src/core/viz-spec/schema";

const COLORS = ["#3157d5", "#7c5ce7", "#15a38b", "#e18a27", "#db5068"];

function numeric(value: DataValue | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replaceAll(",", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function aggregateRows(rows: DataRow[], xKey: string, yKey: string) {
  const grouped = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    const label = String(row[xKey] ?? "(비어 있음)");
    const current = grouped.get(label) ?? { sum: 0, count: 0 };
    current.sum += numeric(row[yKey]);
    current.count += 1;
    grouped.set(label, current);
  }

  return Array.from(grouped, ([label, value]) => ({
    label,
    sum: value.sum,
    average: value.count === 0 ? 0 : value.sum / value.count,
  }));
}

function cartesianOption(spec: VizSpec, rows: DataRow[]): EChartsOption {
  const yKey = spec.encoding.y;
  if (!yKey) return {};
  const seriesType: "bar" | "line" =
    spec.chartType === "bar" ? "bar" : "line";
  const grouped = aggregateRows(rows, spec.encoding.x, yKey);
  const values = grouped.map((item) =>
    spec.aggregate === "average" ? item.average : item.sum,
  );

  return {
    color: COLORS,
    grid: { left: 18, right: 18, top: 54, bottom: 18, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      data: grouped.map((item) => item.label),
      axisLabel: { color: "#677083", hideOverlap: true },
      axisLine: { lineStyle: { color: "#d9dde7" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#677083" },
      splitLine: { lineStyle: { color: "#edf0f5" } },
    },
    series: [
      {
        type: seriesType,
        name: yKey,
        data: values,
        smooth: spec.options.smooth,
        showSymbol: rows.length < 80,
        symbolSize: 7,
        lineStyle: { width: 3 },
        areaStyle:
          spec.chartType === "area" ? { opacity: 0.18, color: COLORS[0] } : undefined,
        itemStyle:
          spec.chartType === "bar"
            ? { borderRadius: [6, 6, 0, 0], color: COLORS[0] }
            : undefined,
        barMaxWidth: 44,
      },
    ],
  };
}

function scatterOption(spec: VizSpec, rows: DataRow[]): EChartsOption {
  const yKey = spec.encoding.y;
  if (!yKey) return {};

  return {
    color: COLORS,
    grid: { left: 18, right: 18, top: 54, bottom: 18, containLabel: true },
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const value = (params as { value?: unknown[] }).value ?? [];
        return `${spec.encoding.x}: ${value[0]}<br/>${yKey}: ${value[1]}`;
      },
    },
    xAxis: {
      type: "value",
      name: spec.encoding.x,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { lineStyle: { color: "#edf0f5" } },
    },
    yAxis: {
      type: "value",
      name: yKey,
      splitLine: { lineStyle: { color: "#edf0f5" } },
    },
    series: [
      {
        type: "scatter",
        data: rows.map((row) => [numeric(row[spec.encoding.x]), numeric(row[yKey])]),
        symbolSize: 10,
        itemStyle: { opacity: 0.75 },
        large: rows.length > 3_000,
      },
    ],
  };
}

function pieOption(spec: VizSpec, rows: DataRow[]): EChartsOption {
  const yKey = spec.encoding.y;
  if (!yKey) return {};
  const grouped = aggregateRows(rows, spec.encoding.x, yKey);

  return {
    color: COLORS,
    tooltip: { trigger: "item", formatter: "{b}<br/>{c} ({d}%)" },
    legend: spec.options.showLegend
      ? { bottom: 4, icon: "circle", textStyle: { color: "#5e6678" } }
      : undefined,
    series: [
      {
        type: "pie",
        radius: ["48%", "72%"],
        center: ["50%", "46%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 6 },
        label: { formatter: "{b}\n{d}%", color: "#3f4656" },
        data: grouped.map((item) => ({ name: item.label, value: item.sum })),
      },
    ],
  };
}

function histogramOption(spec: VizSpec, rows: DataRow[]): EChartsOption {
  const values = rows
    .map((row) => numeric(row[spec.encoding.x]))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const domain = extent(values);
  const bins =
    domain[0] === undefined || domain[1] === undefined
      ? []
      : bin().domain([domain[0], domain[1]]).thresholds(Math.min(16, Math.max(5, Math.ceil(Math.sqrt(values.length)))))(values);

  return {
    color: COLORS,
    grid: { left: 18, right: 18, top: 54, bottom: 18, containLabel: true },
    tooltip: { trigger: "axis", confine: true },
    xAxis: {
      type: "category",
      name: spec.encoding.x,
      data: bins.map((item) => `${Number(item.x0).toLocaleString()}–${Number(item.x1).toLocaleString()}`),
      axisLabel: { color: "#677083", hideOverlap: true },
    },
    yAxis: {
      type: "value",
      name: "빈도",
      minInterval: 1,
      splitLine: { lineStyle: { color: "#edf0f5" } },
    },
    series: [
      {
        type: "bar",
        data: bins.map((item) => item.length),
        barWidth: "92%",
        itemStyle: { color: COLORS[0], borderRadius: [5, 5, 0, 0] },
      },
    ],
  };
}

export function toEChartsOption(spec: VizSpec, rows: DataRow[]): EChartsOption {
  const content =
    spec.chartType === "scatter"
      ? scatterOption(spec, rows)
      : spec.chartType === "pie"
        ? pieOption(spec, rows)
        : spec.chartType === "histogram"
          ? histogramOption(spec, rows)
          : cartesianOption(spec, rows);

  return {
    animationDuration: 450,
    aria: {
      enabled: true,
      description: spec.description,
      decal: { show: true },
    },
    title: {
      text: spec.title,
      subtext: spec.description,
      left: 8,
      textStyle: { color: "#202534", fontSize: 17, fontWeight: 650 },
      subtextStyle: { color: "#7d8494", fontSize: 11 },
    },
    ...content,
  };
}
