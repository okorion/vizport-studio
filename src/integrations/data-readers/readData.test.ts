import { describe, expect, it } from "vitest";
import { readDataText } from "@/src/integrations/data-readers/readData";

describe("readDataText", () => {
  it("parses CSV with dynamic scalar types", async () => {
    const result = await readDataText("team,revenue,active\nA,12,true\nB,18,false");

    expect(result.format).toBe("csv");
    expect(result.rows).toEqual([
      { team: "A", revenue: 12, active: true },
      { team: "B", revenue: 18, active: false },
    ]);
  });

  it("accepts a JSON data envelope", async () => {
    const result = await readDataText('{"data":[{"team":"A","revenue":12}]}');

    expect(result.format).toBe("json");
    expect(result.rows).toEqual([{ team: "A", revenue: 12 }]);
  });

  it("rejects unsupported JSON shapes", async () => {
    await expect(readDataText('{"team":"A"}')).rejects.toThrow("객체 배열");
  });
});
