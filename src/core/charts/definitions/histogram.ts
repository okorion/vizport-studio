import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const histogramDefinition: ChartDefinition = {
  id: "histogram",
  label: "히스토그램",
  recommend({ profile, intent }) {
    const value = firstField(profile, "quantitative");
    if (!value) return null;

    return makeRecommendation(
      this,
      68 + intentBonus(intent, "distribution"),
      `${value.key} 값이 어느 구간에 몰려 있는지 확인할 수 있어요.`,
      {
        title: `${value.key} 분포`,
        description: `${value.key} 값을 구간별 빈도로 표현합니다.`,
        intent,
        encoding: { x: value.key },
        aggregate: "count",
        options: { smooth: false, stacked: false, showLegend: false },
        renderer: { preferred: "auto" },
      },
    );
  },
};
