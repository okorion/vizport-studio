import { create } from "zustand";
import { analyzeFileInput, analyzeTextInput } from "@/src/application/analyzeInput";
import { createVisualization } from "@/src/application/createVisualization";
import type { DataProfile, DataRow } from "@/src/core/data/types";
import type {
  Recommendation,
  VisualizationIntent,
  VizSpec,
} from "@/src/core/viz-spec/schema";
import { SAMPLE_CSV, SAMPLE_ROWS } from "@/src/features/studio/sampleData";
import type { SavedProject } from "@/src/integrations/storage/projectDb";

export type OutputTab = "code" | "prompt" | "spec";

interface StudioState {
  inputText: string;
  sourceName: string;
  intent: VisualizationIntent;
  rows: DataRow[];
  profile: DataProfile;
  recommendations: Recommendation[];
  selectedSpec: VizSpec | null;
  selectedRecommendationId: string | null;
  warnings: string[];
  status: "idle" | "analyzing" | "ready" | "error";
  error: string | null;
  outputTab: OutputTab;
  aiSummary: string | null;
  setInputText(value: string): void;
  setIntent(value: VisualizationIntent): void;
  setOutputTab(value: OutputTab): void;
  applyAiRefinement(recommendations: Recommendation[], summary: string): void;
  selectRecommendation(id: string): void;
  analyzeText(): Promise<void>;
  analyzeFile(file: File): Promise<void>;
  restoreSample(): void;
  restoreProject(project: SavedProject): void;
}

const initial = createVisualization(SAMPLE_ROWS, "auto");

export const useStudioStore = create<StudioState>((set, get) => ({
  inputText: SAMPLE_CSV,
  sourceName: "sample-sales.csv",
  intent: "auto",
  rows: SAMPLE_ROWS,
  profile: initial.profile,
  recommendations: initial.recommendations,
  selectedSpec: initial.selectedSpec,
  selectedRecommendationId: initial.recommendations[0]?.id ?? null,
  warnings: [],
  status: "ready",
  error: null,
  outputTab: "code",
  aiSummary: null,
  setInputText: (inputText) => set({ inputText }),
  setOutputTab: (outputTab) => set({ outputTab }),
  applyAiRefinement: (recommendations, aiSummary) => {
    const selectedRecommendationId = recommendations[0]?.id ?? null;
    set({
      recommendations,
      aiSummary,
      selectedRecommendationId,
      selectedSpec: recommendations[0]?.spec ?? null,
    });
  },
  setIntent: (intent) => {
    const next = createVisualization(get().rows, intent);
    set({
      intent,
      ...next,
      aiSummary: null,
      selectedRecommendationId: next.recommendations[0]?.id ?? null,
    });
  },
  selectRecommendation: (id) => {
    const recommendation = get().recommendations.find((item) => item.id === id);
    if (!recommendation) return;
    set({ selectedRecommendationId: id, selectedSpec: recommendation.spec });
  },
  analyzeText: async () => {
    set({ status: "analyzing", error: null });
    try {
      const result = await analyzeTextInput(get().inputText, get().intent);
      set({
        ...result,
        sourceName: result.format === "json" ? "pasted-data.json" : "pasted-data.csv",
        aiSummary: null,
        selectedRecommendationId: result.recommendations[0]?.id ?? null,
        status: "ready",
      });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "데이터를 분석하지 못했어요.",
      });
    }
  },
  analyzeFile: async (file) => {
    set({ status: "analyzing", error: null });
    try {
      const result = await analyzeFileInput(file, get().intent);
      set({
        ...result,
        inputText: file.size < 200_000 ? await file.text() : get().inputText,
        sourceName: file.name,
        aiSummary: null,
        selectedRecommendationId: result.recommendations[0]?.id ?? null,
        status: "ready",
      });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "파일을 분석하지 못했어요.",
      });
    }
  },
  restoreSample: () => {
    const result = createVisualization(SAMPLE_ROWS, get().intent);
    set({
      inputText: SAMPLE_CSV,
      sourceName: "sample-sales.csv",
      rows: SAMPLE_ROWS,
      ...result,
      selectedRecommendationId: result.recommendations[0]?.id ?? null,
      warnings: [],
      aiSummary: null,
      status: "ready",
      error: null,
    });
  },
  restoreProject: (project) => {
    const result = createVisualization(project.rows, project.intent);
    const selected = project.selectedSpec
      ? result.recommendations.find(
          (item) => item.spec.chartType === project.selectedSpec?.chartType,
        )
      : result.recommendations[0];
    set({
      sourceName: project.sourceName,
      inputText: project.inputText,
      intent: project.intent,
      rows: project.rows,
      profile: result.profile,
      recommendations: result.recommendations,
      selectedSpec: project.selectedSpec ?? result.selectedSpec,
      selectedRecommendationId: selected?.id ?? null,
      warnings: [],
      status: "ready",
      error: null,
      aiSummary: null,
    });
  },
}));
