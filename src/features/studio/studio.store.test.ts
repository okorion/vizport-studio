import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_FILE_SIZE_MB,
  useStudioStore,
} from "@/src/features/studio/studio.store";

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

  it("does not overwrite a newer text edit with a stale analysis result", async () => {
    useStudioStore.getState().setInputText("category,value\nOLD,10");
    const analysis = useStudioStore.getState().analyzeText();

    useStudioStore.getState().setInputText("category,value\nLATEST,99");
    await analysis;

    const state = useStudioStore.getState();
    expect(state.inputText).toBe("category,value\nLATEST,99");
    expect(state.hasUnanalyzedChanges).toBe(true);
    expect(state.status).toBe("idle");
    expect(state.rows).not.toEqual([{ category: "OLD", value: 10 }]);
  });

  it("keeps the newest result when file analyses finish out of order", async () => {
    const delayedJsonFile = (name: string, category: string, delay: number) =>
      ({
        name,
        text: () =>
          new Promise<string>((resolve) => {
            setTimeout(
              () => resolve(JSON.stringify([{ category, value: 10 }])),
              delay,
            );
          }),
      }) as File;

    const first = useStudioStore
      .getState()
      .analyzeFile(delayedJsonFile("first-slow.json", "SLOW", 30));
    const second = useStudioStore
      .getState()
      .analyzeFile(delayedJsonFile("second-fast.json", "LATEST", 1));

    await Promise.all([first, second]);

    const state = useStudioStore.getState();
    expect(state.sourceName).toBe("second-fast.json");
    expect(state.rows).toEqual([{ category: "LATEST", value: 10 }]);
    expect(state.hasUnanalyzedChanges).toBe(false);
    expect(state.status).toBe("ready");
  });

  it("rejects oversized files before reading them", async () => {
    let readAttempted = false;
    const oversizedFile = {
      name: "too-large.csv",
      size: MAX_FILE_SIZE_MB * 1024 * 1024 + 1,
      text: async () => {
        readAttempted = true;
        return "category,value\nA,10";
      },
    } as File;

    await useStudioStore.getState().analyzeFile(oversizedFile);

    const state = useStudioStore.getState();
    expect(readAttempted).toBe(false);
    expect(state.status).toBe("error");
    expect(state.error).toContain(`${MAX_FILE_SIZE_MB}MB 이하`);
    expect(state.sourceName).toBe("sample-sales.csv");
  });

  it("restores the last committed state when the latest file fails", async () => {
    const slowValidFile = {
      name: "valid-slow.json",
      size: 100,
      text: () =>
        new Promise<string>((resolve) => {
          setTimeout(
            () => resolve(JSON.stringify([{ category: "SLOW", value: 10 }])),
            30,
          );
        }),
    } as File;
    const oversizedFile = {
      name: "latest-too-large.csv",
      size: MAX_FILE_SIZE_MB * 1024 * 1024 + 1,
      text: async () => "category,value\nLATEST,99",
    } as File;

    const staleAnalysis = useStudioStore.getState().analyzeFile(slowValidFile);
    await useStudioStore.getState().analyzeFile(oversizedFile);
    await staleAnalysis;

    const state = useStudioStore.getState();
    expect(state.sourceName).toBe("sample-sales.csv");
    expect(state.inputText).toBeDefined();
    expect(state.rows).toHaveLength(12);
    expect(state.rows[0]).toMatchObject({
      month: "2025-01-01",
      product: "Atlas",
      revenue: 124000,
    });
    expect(state.hasUnanalyzedChanges).toBe(false);
    expect(state.status).toBe("error");
    expect(state.error).toContain(`${MAX_FILE_SIZE_MB}MB 이하`);
  });

  it("restores committed data before applying an intent that cancels a file", async () => {
    const slowValidFile = {
      name: "valid-slow.json",
      size: 100,
      text: () =>
        new Promise<string>((resolve) => {
          setTimeout(
            () => resolve(JSON.stringify([{ category: "SLOW", value: 10 }])),
            30,
          );
        }),
    } as File;

    const staleAnalysis = useStudioStore.getState().analyzeFile(slowValidFile);
    useStudioStore.getState().setIntent("composition");
    await staleAnalysis;

    const state = useStudioStore.getState();
    expect(state.sourceName).toBe("sample-sales.csv");
    expect(state.intent).toBe("composition");
    expect(state.rows).toHaveLength(12);
    expect(state.hasUnanalyzedChanges).toBe(false);
    expect(state.status).toBe("ready");
  });
});
