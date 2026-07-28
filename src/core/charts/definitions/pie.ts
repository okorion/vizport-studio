import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const pieDefinition: ChartDefinition = {
  id: "pie",
  label: "도넛 차트",
  recommend({ profile, intent }) {
    const category = firstField(profile, "categorical");
    const value = firstField(profile, "quantitative");
    if (!category || !value || category.uniqueCount > 8) return null;

    return makeRecommendation(
      this,
      60 + intentBonus(intent, "composition"),
      `${category.key} 항목 수가 적어 전체 구성비를 간단히 보여줄 수 있어요.`,
      {
        title: `${category.key} 구성비`,
        description: `${value.key} 합계에서 각 ${category.key}가 차지하는 비율입니다.`,
        intent,
        encoding: { x: category.key, y: value.key },
        aggregate: "sum",
        options: { smooth: false, stacked: false, showLegend: true },
        renderer: { preferred: "auto" },
      },
      "정확한 값 비교가 목적이면 막대 차트가 더 적합해요.",
    );
  },
};
