import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const barDefinition: ChartDefinition = {
  id: "bar",
  label: "막대 차트",
  recommend({ profile, intent }) {
    const category = firstField(profile, "categorical");
    const value = firstField(profile, "quantitative");
    if (!category || !value) return null;

    const caution =
      category.uniqueCount > 18
        ? "항목이 많아 상위 항목 필터나 스크롤이 필요할 수 있어요."
        : undefined;

    return makeRecommendation(
      this,
      76 + intentBonus(intent, "comparison") - (category.uniqueCount > 18 ? 12 : 0),
      `${category.key}별 ${value.key} 크기를 가장 빠르게 비교할 수 있어요.`,
      {
        title: `${category.key}별 ${value.key}`,
        description: `${category.key} 범주의 ${value.key} 값을 비교합니다.`,
        intent,
        encoding: { x: category.key, y: value.key },
        aggregate: "sum",
        options: { smooth: false, stacked: false, showLegend: false },
        renderer: { preferred: "auto" },
      },
      caution,
    );
  },
};
