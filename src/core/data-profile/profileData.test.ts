import { describe, expect, it } from "vitest";
import { profileData } from "@/src/core/data-profile/profileData";

describe("profileData", () => {
  it("infers the common field kinds and numeric summary", () => {
    const profile = profileData([
      { date: "2025-01-01", team: "A", revenue: 10, active: true },
      { date: "2025-02-01", team: "B", revenue: 30, active: false },
    ]);

    expect(profile.rowCount).toBe(2);
    expect(profile.fields.map(({ key, kind }) => [key, kind])).toEqual([
      ["date", "temporal"],
      ["team", "categorical"],
      ["revenue", "quantitative"],
      ["active", "boolean"],
    ]);
    expect(profile.fields.find((field) => field.key === "revenue")?.numeric).toEqual({
      min: 10,
      max: 30,
      mean: 20,
      median: 20,
    });
  });
});
