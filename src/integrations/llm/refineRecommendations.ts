import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  extractJsonMiddleware,
  generateText,
  Output,
  wrapLanguageModel,
} from "ai";
import { z } from "zod";
import type { DataProfile } from "@/src/core/data/types";
import {
  chartTypeSchema,
  type Recommendation,
  type VisualizationIntent,
} from "@/src/core/viz-spec/schema";

const refinementSchema = z.object({
  summary: z.string().min(1).max(240),
  ranking: z
    .array(
      z.object({
        chartType: chartTypeSchema,
        explanation: z.string().min(1).max(180),
      }),
    )
    .min(1)
    .max(3),
});

type Refinement = z.infer<typeof refinementSchema>;

export interface OpenAICompatibleSettings {
  mode: "openai-compatible";
  baseURL: string;
  model: string;
  apiKey?: string;
}

export interface WebLlmSettings {
  mode: "webllm";
  model: string;
  onProgress?: (message: string) => void;
}

export type LocalAiSettings = OpenAICompatibleSettings | WebLlmSettings;

function buildPrompt(
  profile: DataProfile,
  intent: VisualizationIntent,
  recommendations: Recommendation[],
): string {
  return `You are refining a deterministic visualization recommendation.
Use only the chart types already present in candidates. Do not invent a new chart.
Prefer clear and truthful charts over decorative charts.

User intent: ${intent}

Data profile:
${JSON.stringify(
  profile.fields.map((field) => ({
    name: field.key,
    kind: field.kind,
    uniqueCount: field.uniqueCount,
    nullCount: field.nullCount,
    numeric: field.numeric,
  })),
  null,
  2,
)}

Candidates:
${JSON.stringify(
  recommendations.map((item) => ({
    chartType: item.spec.chartType,
    ruleScore: item.score,
    reason: item.reason,
    mapping: item.spec.encoding,
  })),
  null,
  2,
)}

Return the candidates in best-first order with one concise Korean explanation each.`;
}

async function refineWithOpenAICompatible(
  settings: OpenAICompatibleSettings,
  prompt: string,
): Promise<Refinement> {
  const provider = createOpenAICompatible({
    name: "local",
    baseURL: settings.baseURL.replace(/\/$/, ""),
    apiKey: settings.apiKey || "local",
  });
  const model = wrapLanguageModel({
    model: provider(settings.model),
    middleware: extractJsonMiddleware(),
  });
  const { output } = await generateText({
    model,
    output: Output.object({ schema: refinementSchema }),
    prompt,
  });

  return refinementSchema.parse(output);
}

function parseJsonContent(content: string): unknown {
  return JSON.parse(
    content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, ""),
  );
}

async function refineWithWebLlm(
  settings: WebLlmSettings,
  prompt: string,
): Promise<Refinement> {
  settings.onProgress?.("브라우저 모델을 준비하는 중…");
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
  const engine = await CreateMLCEngine(settings.model, {
    initProgressCallback: (progress) => {
      settings.onProgress?.(progress.text);
    },
  });

  settings.onProgress?.("추천 이유를 분석하는 중…");
  const response = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Return valid JSON only. Follow the requested schema and write explanations in Korean.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_object",
      schema: JSON.stringify(z.toJSONSchema(refinementSchema)),
    },
    temperature: 0.2,
  });
  const content = response.choices[0]?.message.content;
  if (typeof content !== "string") {
    throw new Error("브라우저 모델이 결과를 반환하지 않았어요.");
  }

  return refinementSchema.parse(parseJsonContent(content));
}

function applyRefinement(
  recommendations: Recommendation[],
  refinement: Refinement,
): Recommendation[] {
  const byType = new Map(
    recommendations.map((item) => [item.spec.chartType, item]),
  );
  const used = new Set<string>();
  const ranked = refinement.ranking.flatMap((item) => {
    const recommendation = byType.get(item.chartType);
    if (!recommendation || used.has(recommendation.id)) return [];
    used.add(recommendation.id);
    return [{ ...recommendation, aiReason: item.explanation }];
  });

  return [
    ...ranked,
    ...recommendations.filter((item) => !used.has(item.id)),
  ];
}

export async function refineRecommendations(
  settings: LocalAiSettings,
  profile: DataProfile,
  intent: VisualizationIntent,
  recommendations: Recommendation[],
): Promise<{ recommendations: Recommendation[]; summary: string }> {
  const prompt = buildPrompt(profile, intent, recommendations);
  const refinement =
    settings.mode === "webllm"
      ? await refineWithWebLlm(settings, prompt)
      : await refineWithOpenAICompatible(settings, prompt);

  return {
    recommendations: applyRefinement(recommendations, refinement),
    summary: refinement.summary,
  };
}

export async function getWebLlmModelOptions() {
  const { prebuiltAppConfig, ModelType } = await import("@mlc-ai/web-llm");
  return prebuiltAppConfig.model_list
    .filter(
      (model) =>
        model.model_type === undefined || model.model_type === ModelType.LLM,
    )
    .sort(
      (a, b) =>
        (a.vram_required_MB ?? Number.MAX_SAFE_INTEGER) -
        (b.vram_required_MB ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, 10)
    .map((model) => ({
      id: model.model_id,
      vramMB: model.vram_required_MB,
      lowResource: model.low_resource_required ?? false,
    }));
}
