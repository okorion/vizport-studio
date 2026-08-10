import { beforeEach, describe, expect, it } from "vitest";
import { useStudioStore } from "@/src/features/studio/studio.store";

describe("studio store input consistency", () => {
  beforeEach(() => {
    useStudioStore.getState().restoreSample();
    useStudioStore.getState().setIntent("auto");
  });

  it("marks edited text as pending and does not recompute old rows", () => {
    const previousRecommendations = useStudioStore.getState().recommendations;

    useStudioStore.getState().setInputText("category,value\nA,10\nB,20");
    useStudioStore.getState().setIntent("composition");

    const state = useStudioStore.getState();
    expect(state.hasUnanalyzedChanges).toBe(true);
    expect(state.sourceName).toBe("편집 중 · 분석 전");
    expect(state.intent).toBe("composition");
    expect(state.recommendations).toBe(previousRecommendations);
  });

  it("publishes new rows only after analysis succeeds", async () => {
    useStudioStore.getState().setInputText("category,value\nA,10\nB,20");

    await useStudioStore.getState().analyzeText();

    const state = useStudioStore.getState();
    expect(state.hasUnanalyzedChanges).toBe(false);
    expect(state.rows).toEqual([
      { category: "A", value: 10 },
      { category: "B", value: 20 },
    ]);
    expect(state.sourceName).toBe("pasted-data.csv");
  });
});
