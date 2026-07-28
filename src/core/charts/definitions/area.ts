import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const areaDefinition: ChartDefinition = {
  id: "area",
  label: "영역 차트",
  recommend({ profile, intent }) {
    const time = firstField(profile, "temporal");
    const value = firstField(profile, "quantitative");
    if (!time || !value) return null;

    return makeRecommendation(
      this,
      70 + intentBonus(intent, "trend"),
      `${value.key}의 변화량과 전체 규모를 함께 강조할 수 있어요.`,
      {
        title: `${value.key} 변화량`,
        description: `${time.key}에 따른 ${value.key}의 규모와 추세입니다.`,
        intent,
        encoding: { x: time.key, y: value.key },
        aggregate: "sum",
        options: { smooth: true, stacked: false, showLegend: false },
        renderer: { preferred: "auto" },
      },
      "정확한 시점 간 비교가 중요하면 선 차트가 더 명확해요.",
    );
  },
};
