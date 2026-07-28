"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  AriaComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { DataRow } from "@/src/core/data/types";
import type { VizSpec } from "@/src/core/viz-spec/schema";
import { toEChartsOption } from "@/src/integrations/renderers/echarts/toEChartsOption";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AriaComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  CanvasRenderer,
]);

interface ChartPreviewProps {
  rows: DataRow[];
  spec: VizSpec;
}

export function ChartPreview({ rows, spec }: ChartPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
    chart.setOption(toEChartsOption(spec, rows), true);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [rows, spec]);

  return (
    <div
      ref={containerRef}
      className="chart-canvas"
      role="img"
      aria-label={spec.description}
    />
  );
}
