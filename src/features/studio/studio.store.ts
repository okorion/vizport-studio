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
export const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  hasUnanalyzedChanges: boolean;
  dataRevision: number;
  outputTab: OutputTab;
  aiSummary: string | null;
  setInputText(value: string): void;
  setIntent(value: VisualizationIntent): void;
  setOutputTab(value: OutputTab): void;
  applyAiRefinement(
    recommendations: Recommendation[],
    summary: string,
    expectedRevision: number,
  ): boolean;
  selectRecommendation(id: string): void;
  analyzeText(): Promise<void>;
  analyzeFile(file: File): Promise<void>;
  restoreSample(): void;
  restoreProject(project: SavedProject): void;
}

const initial = createVisualization(SAMPLE_ROWS, "auto");
let latestAnalysisRequest = 0;

function invalidatePendingAnalysis() {
  latestAnalysisRequest += 1;
}

function beginAnalysis() {
  latestAnalysisRequest += 1;
  return latestAnalysisRequest;
}

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
  hasUnanalyzedChanges: false,
  dataRevision: 0,
  outputTab: "code",
  aiSummary: null,
  setInputText: (inputText) => {
    invalidatePendingAnalysis();
    set((state) => ({
      inputText,
      sourceName: "편집 중 · 분석 전",
      hasUnanalyzedChanges: true,
      dataRevision: state.dataRevision + 1,
      warnings: [],
      status: "idle",
      error: null,
      aiSummary: null,
    }));
  },
  setOutputTab: (outputTab) => set({ outputTab }),
  applyAiRefinement: (recommendations, aiSummary, expectedRevision) => {
    const state = get();
    if (state.hasUnanalyzedChanges || state.dataRevision !== expectedRevision) {
      return false;
    }
    const selectedRecommendationId = recommendations[0]?.id ?? null;
    set({
      recommendations,
      aiSummary,
      selectedRecommendationId,
      selectedSpec: recommendations[0]?.spec ?? null,
    });
    return true;
  },
  setIntent: (intent) => {
    invalidatePendingAnalysis();
    const state = get();
    if (state.hasUnanalyzedChanges) {
      set({
        intent,
        aiSummary: null,
        dataRevision: state.dataRevision + 1,
        status: "idle",
        error: null,
      });
      return;
    }

    const next = createVisualization(state.rows, intent);
    set({
      intent,
      ...next,
      aiSummary: null,
      dataRevision: state.dataRevision + 1,
      selectedRecommendationId: next.recommendations[0]?.id ?? null,
      status: "ready",
      error: null,
    });
  },
  selectRecommendation: (id) => {
    const state = get();
    if (state.hasUnanalyzedChanges) return;
    const recommendation = state.recommendations.find((item) => item.id === id);
    if (!recommendation) return;
    set({ selectedRecommendationId: id, selectedSpec: recommendation.spec });
  },
  analyzeText: async () => {
    const requestId = beginAnalysis();
    const { inputText, intent } = get();
    set((state) => ({
      status: "analyzing",
      error: null,
      dataRevision: state.dataRevision + 1,
    }));
    try {
      const result = await analyzeTextInput(inputText, intent);
      if (requestId !== latestAnalysisRequest) return;
      set({
        ...result,
        sourceName: result.format === "json" ? "pasted-data.json" : "pasted-data.csv",
        aiSummary: null,
        selectedRecommendationId: result.recommendations[0]?.id ?? null,
        status: "ready",
        hasUnanalyzedChanges: false,
      });
    } catch (error) {
      if (requestId !== latestAnalysisRequest) return;
      set({
        status: "error",
        error: error instanceof Error ? error.message : "데이터를 분석하지 못했어요.",
      });
    }
  },
  analyzeFile: async (file) => {
    const requestId = beginAnalysis();
    const stateBeforeAnalysis = get();
    if (file.size > MAX_FILE_BYTES) {
      set({
        status: "error",
        error: `파일은 ${MAX_FILE_SIZE_MB}MB 이하로 선택해 주세요.`,
      });
      return;
    }
    const intent = stateBeforeAnalysis.intent;
    set({
      status: "analyzing",
      error: null,
      sourceName: `${file.name} · 분석 중`,
      hasUnanalyzedChanges: true,
      dataRevision: stateBeforeAnalysis.dataRevision + 1,
    });
    try {
      const [result, inputText] = await Promise.all([
        analyzeFileInput(file, intent),
        file.text(),
      ]);
      if (requestId !== latestAnalysisRequest) return;
      set({
        ...result,
        inputText,
        sourceName: file.name,
        aiSummary: null,
        selectedRecommendationId: result.recommendations[0]?.id ?? null,
        status: "ready",
        hasUnanalyzedChanges: false,
      });
    } catch (error) {
      if (requestId !== latestAnalysisRequest) return;
      set({
        status: "error",
        error: error instanceof Error ? error.message : "파일을 분석하지 못했어요.",
        sourceName: stateBeforeAnalysis.sourceName,
        hasUnanalyzedChanges: stateBeforeAnalysis.hasUnanalyzedChanges,
      });
    }
  },
  restoreSample: () => {
    invalidatePendingAnalysis();
    const state = get();
    const result = createVisualization(SAMPLE_ROWS, state.intent);
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
      hasUnanalyzedChanges: false,
      dataRevision: state.dataRevision + 1,
    });
  },
  restoreProject: (project) => {
    invalidatePendingAnalysis();
    const dataRevision = get().dataRevision + 1;
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
      hasUnanalyzedChanges: false,
      dataRevision,
    });
  },
}));
