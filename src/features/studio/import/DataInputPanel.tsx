"use client";

import { useRef } from "react";
import { ChevronDown, FileUp, Play, RotateCcw } from "lucide-react";
import type { VisualizationIntent } from "@/src/core/viz-spec/schema";
import {
  MAX_FILE_SIZE_MB,
  useStudioStore,
} from "@/src/features/studio/studio.store";

const INTENTS: Array<{ value: VisualizationIntent; label: string }> = [
  { value: "auto", label: "데이터에 맞게 자동 선택" },
  { value: "comparison", label: "항목 간 비교" },
  { value: "trend", label: "시간 흐름과 추세" },
  { value: "distribution", label: "값의 분포" },
  { value: "relationship", label: "두 값의 관계" },
  { value: "composition", label: "전체 구성비" },
];

export function DataInputPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    inputText,
    sourceName,
    intent,
    status,
    error,
    warnings,
    hasUnanalyzedChanges,
    setInputText,
    setIntent,
    analyzeText,
    analyzeFile,
    restoreSample,
  } = useStudioStore();

  return (
    <section
      className="panel input-panel"
      id="data"
      aria-labelledby="data-input-title"
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">STEP 1</span>
          <h2 id="data-input-title">데이터 넣기</h2>
        </div>
        <button className="icon-button" type="button" onClick={restoreSample} title="샘플 복원">
          <RotateCcw size={16} aria-hidden="true" />
          <span className="sr-only">샘플 데이터 복원</span>
        </button>
      </div>

      <div className="source-row">
        <span className="source-dot" aria-hidden="true" />
        <span className="source-name">{sourceName}</span>
        <button className="text-button" type="button" onClick={() => fileInputRef.current?.click()}>
          <FileUp size={15} aria-hidden="true" /> 파일 선택
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          aria-label="CSV, TSV 또는 JSON 파일 선택"
          accept=".csv,.tsv,.json,text/csv,application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void analyzeFile(file);
            event.target.value = "";
          }}
        />
      </div>

      <label className="field-label" htmlFor="data-input">
        CSV 또는 JSON
      </label>
      <textarea
        id="data-input"
        className="data-textarea"
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        spellCheck={false}
        aria-describedby="data-input-help"
      />
      <p id="data-input-help" className="field-help">
        원본 데이터는 이 브라우저 안에서만 분석됩니다. 파일은 최대 {MAX_FILE_SIZE_MB}MB입니다.
      </p>

      {hasUnanalyzedChanges ? (
        <p className="notice notice-info" role="status">
          입력이 바뀌었어요. 분석하면 추천·미리보기·내보내기가 새 데이터로 갱신됩니다.
        </p>
      ) : null}

      <label className="field-label" htmlFor="visualization-intent">
        보여주고 싶은 내용
      </label>
      <div className="select-shell">
        <select
          id="visualization-intent"
          className="select-input"
          value={intent}
          onChange={(event) => setIntent(event.target.value as VisualizationIntent)}
        >
          {INTENTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-chevron" size={15} aria-hidden="true" />
      </div>

      <div aria-live="polite">
        {error ? <p className="notice notice-error">{error}</p> : null}
        {warnings.map((warning) => (
          <p className="notice notice-warning" key={warning}>
            {warning}
          </p>
        ))}
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={() => void analyzeText()}
        disabled={status === "analyzing" || inputText.trim().length === 0}
      >
        <Play size={16} fill="currentColor" aria-hidden="true" />
        {status === "analyzing"
          ? "분석 중…"
          : hasUnanalyzedChanges
            ? "변경사항 분석하기"
            : "추천 결과 새로고침"}
      </button>
    </section>
  );
}
