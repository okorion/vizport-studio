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
    const container = containerRef.current;
    if (!container) return;
    const chart = echarts.init(container, undefined, { renderer: "canvas" });
    chart.setOption(toEChartsOption(spec, rows), true);

    let frame = 0;
    let previousWidth = Math.round(container.clientWidth);
    let previousHeight = Math.round(container.clientHeight);
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (
        width === 0 ||
        height === 0 ||
        (width === previousWidth && height === previousHeight)
      ) {
        return;
      }

      previousWidth = width;
      previousHeight = height;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => chart.resize({ width, height }));
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
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
