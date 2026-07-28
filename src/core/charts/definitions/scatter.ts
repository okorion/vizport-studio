import {
  firstField,
  intentBonus,
  makeRecommendation,
  type ChartDefinition,
} from "@/src/core/charts/chart-definition";

export const scatterDefinition: ChartDefinition = {
  id: "scatter",
  label: "산점도",
  recommend({ profile, intent }) {
    const x = firstField(profile, "quantitative");
    const y = x ? firstField(profile, "quantitative", [x.key]) : undefined;
    if (!x || !y) return null;

    return makeRecommendation(
      this,
      74 + intentBonus(intent, "relationship"),
      `${x.key}와 ${y.key} 사이의 관계와 이상치를 확인하기 좋아요.`,
      {
        title: `${x.key}와 ${y.key}의 관계`,
        description: `두 수치 필드의 관계를 점으로 표현합니다.`,
        intent,
        encoding: { x: x.key, y: y.key },
        aggregate: "none",
        options: { smooth: false, stacked: false, showLegend: false },
        renderer: {
          preferred: profile.rowCount >= 100_000 ? "webgpu" : "auto",
        },
      },
    );
  },
};
