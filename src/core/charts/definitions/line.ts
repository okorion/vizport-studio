import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const lineDefinition: ChartDefinition = {
  id: "line",
  label: "선 차트",
  recommend({ profile, intent }) {
    const time = firstField(profile, "temporal");
    const value = firstField(profile, "quantitative");
    if (!time || !value) return null;

    return makeRecommendation(
      this,
      82 + intentBonus(intent, "trend"),
      `${time.key} 흐름에 따른 ${value.key} 변화를 읽기 좋아요.`,
      {
        title: `${value.key} 추이`,
        description: `${time.key} 순서에 따른 ${value.key} 추세입니다.`,
        intent,
        encoding: { x: time.key, y: value.key },
        aggregate: "sum",
        options: { smooth: true, stacked: false, showLegend: false },
        renderer: { preferred: "auto" },
      },
    );
  },
};
