"use client";

import { useState } from "react";
import { BrainCircuit, ChevronDown, LoaderCircle, Sparkles } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";
import {
  getWebLlmModelOptions,
  refineRecommendations,
} from "@/src/integrations/llm/refineRecommendations";

type AiMode = "openai-compatible" | "webllm";

interface WebModelOption {
  id: string;
  vramMB?: number;
  lowResource: boolean;
}

export function AiRefinePanel() {
  const {
    profile,
    intent,
    recommendations,
    aiSummary,
    applyAiRefinement,
  } = useStudioStore();
  const [mode, setMode] = useState<AiMode>("openai-compatible");
  const [baseURL, setBaseURL] = useState("http://localhost:11434/v1");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webModels, setWebModels] = useState<WebModelOption[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function selectWebLlm() {
    setMode("webllm");
    setError("");
    if (webModels.length > 0) {
      setModel(webModels[0]?.id ?? "");
      return;
    }

    setProgress("지원 모델 목록을 확인하는 중…");
    try {
      const options = await getWebLlmModelOptions();
      setWebModels(options);
      setModel(options[0]?.id ?? "");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "모델 목록을 불러오지 못했어요.",
      );
    } finally {
      setProgress("");
    }
  }

  async function runRefinement() {
    if (!model.trim() || recommendations.length === 0) return;
    setStatus("loading");
    setError("");
    setProgress(mode === "webllm" ? "모델을 준비하는 중…" : "로컬 모델에 연결하는 중…");

    try {
      const result = await refineRecommendations(
        mode === "webllm"
          ? { mode, model, onProgress: setProgress }
          : { mode, model, baseURL, apiKey },
        profile,
        intent,
        recommendations,
      );
      applyAiRefinement(result.recommendations, result.summary);
      setProgress("");
      setStatus("done");
    } catch (reason) {
      setStatus("error");
      setError(
        reason instanceof Error
          ? reason.message
          : "로컬 모델로 추천을 다듬지 못했어요.",
      );
    }
  }

  const browserGpuAvailable =
    typeof navigator !== "undefined" && "gpu" in navigator;

  return (
    <details className="ai-refine-panel">
      <summary>
        <span><BrainCircuit size={15} aria-hidden="true" /> 로컬 AI로 추천 다듬기</span>
        <ChevronDown size={14} aria-hidden="true" />
      </summary>
      <div className="ai-refine-content">
        <p>
          규칙 추천은 그대로 두고, 필드 의미를 읽어 후보 순서와 설명만 보정합니다.
          원본 데이터는 모델에 보내지 않습니다.
        </p>

        <div className="segmented-control" aria-label="로컬 AI 실행 방식">
          <button
            type="button"
            className={mode === "openai-compatible" ? "is-active" : ""}
            onClick={() => { setMode("openai-compatible"); setModel(""); setError(""); }}
          >
            Ollama / LM Studio
          </button>
          <button
            type="button"
            className={mode === "webllm" ? "is-active" : ""}
            onClick={() => void selectWebLlm()}
          >
            브라우저 WebLLM
          </button>
        </div>

        {mode === "openai-compatible" ? (
          <div className="ai-fields">
            <label>
              <span>API 주소</span>
              <input value={baseURL} onChange={(event) => setBaseURL(event.target.value)} />
            </label>
            <label>
              <span>모델 ID</span>
              <input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="로컬에 설치된 모델 이름"
              />
            </label>
            <label>
              <span>API 키 <small>선택</small></span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                autoComplete="off"
                placeholder="브라우저에 저장하지 않음"
              />
            </label>
          </div>
        ) : (
          <div className="ai-fields">
            <label>
              <span>브라우저 모델</span>
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                {webModels.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id}{option.vramMB ? ` · 약 ${Math.round(option.vramMB / 1024 * 10) / 10}GB` : ""}
                  </option>
                ))}
              </select>
            </label>
            {!browserGpuAvailable ? (
              <p className="ai-inline-warning">이 브라우저에서는 WebGPU를 사용할 수 없어요.</p>
            ) : null}
          </div>
        )}

        {progress ? (
          <p className="ai-progress"><LoaderCircle className="spin" size={13} /> {progress}</p>
        ) : null}
        {error ? <p className="ai-inline-error">{error}</p> : null}
        {aiSummary ? <p className="ai-summary"><Sparkles size={13} /> {aiSummary}</p> : null}

        <button
          className="ai-run-button"
          type="button"
          disabled={!model.trim() || status === "loading" || (mode === "webllm" && !browserGpuAvailable)}
          onClick={() => void runRefinement()}
        >
          {status === "loading" ? "분석 중…" : "추천 순서 다듬기"}
        </button>
      </div>
    </details>
  );
}
