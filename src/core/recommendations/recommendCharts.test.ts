import { describe, expect, it } from "vitest";
import { profileData } from "@/src/core/data-profile/profileData";
import { recommendCharts } from "@/src/core/recommendations/recommendCharts";
import { SAMPLE_ROWS } from "@/src/features/studio/sampleData";

describe("recommendCharts", () => {
  it("prefers a line chart for temporal trend data", () => {
    const recommendations = recommendCharts(profileData(SAMPLE_ROWS), "trend");

    expect(recommendations).toHaveLength(3);
    expect(recommendations[0]?.spec.chartType).toBe("line");
    expect(recommendations[0]?.spec.encoding).toEqual({ x: "month", y: "revenue" });
  });

  it("never recommends a chart without its required fields", () => {
    const recommendations = recommendCharts(
      profileData([{ category: "A" }, { category: "B" }]),
      "auto",
    );

    expect(recommendations).toEqual([]);
  });
});
