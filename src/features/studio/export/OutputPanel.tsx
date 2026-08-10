"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageOpen } from "lucide-react";
import { useStudioStore, type OutputTab } from "@/src/features/studio/studio.store";
import {
  buildInstallCommand,
  buildReactEChartsSource,
} from "@/src/integrations/exporters/reactEcharts";
import { buildImplementationPrompt } from "@/src/integrations/exporters/prompt";

const TABS: Array<{ id: OutputTab; label: string }> = [
  { id: "code", label: "React 코드" },
  { id: "prompt", label: "LLM 프롬프트" },
  { id: "spec", label: "VizSpec" },
];

type CopyTarget = "output" | "install";
type CopyState = {
  target: CopyTarget;
  result: "success" | "error";
  fingerprint: string;
} | null;

export function OutputPanel() {
  const {
    selectedSpec,
    rows,
    profile,
    outputTab,
    hasUnanalyzedChanges,
    dataRevision,
    setOutputTab,
  } = useStudioStore();
  const [copyState, setCopyState] = useState<CopyState>(null);

  const output = useMemo(() => {
    if (!selectedSpec) return "";
    if (outputTab === "prompt") {
      return buildImplementationPrompt(selectedSpec, profile, rows);
    }
    if (outputTab === "spec") {
      return JSON.stringify(selectedSpec, null, 2);
    }
    return buildReactEChartsSource(selectedSpec);
  }, [outputTab, profile, rows, selectedSpec]);

  const activeTab = TABS.find((tab) => tab.id === outputTab) ?? TABS[0];
  const outputFingerprint = `${dataRevision}:${outputTab}:${output}`;

  if (hasUnanalyzedChanges) {
    return (
      <section className="output-panel output-pending" id="export" aria-labelledby="output-pending-title">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">STEP 4</span>
            <h2 id="output-pending-title">내보내기 대기 중</h2>
          </div>
        </div>
        <p>새 입력을 분석하면 React 코드, LLM 프롬프트, VizSpec을 복사할 수 있어요.</p>
      </section>
    );
  }

  if (!selectedSpec) {
    return (
      <section className="output-panel output-pending" id="export" aria-labelledby="output-empty-title">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">STEP 4</span>
            <h2 id="output-empty-title">내보내기 준비 중</h2>
          </div>
        </div>
        <p>추천 가능한 그래프를 만들면 내보내기 형식이 여기에 나타납니다.</p>
      </section>
    );
  }

  async function copyText(target: CopyTarget, value: string, fingerprint: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState({ target, result: "success", fingerprint });
      window.setTimeout(() => {
        setCopyState((current) =>
          current?.target === target && current.fingerprint === fingerprint
            ? null
            : current,
        );
      }, 3000);
    } catch {
      setCopyState({ target, result: "error", fingerprint });
    }
  }

  const installCommand = buildInstallCommand(selectedSpec);
  const installFingerprint = `${dataRevision}:install:${installCommand}`;
  const activeCopyState = copyState && (
    (copyState.target === "output" && copyState.fingerprint === outputFingerprint) ||
    (copyState.target === "install" && copyState.fingerprint === installFingerprint)
  )
    ? copyState
    : null;
  const outputCopyLabel =
    activeCopyState?.target === "output"
      ? activeCopyState.result === "success"
        ? "복사됨"
        : "복사 실패 · 다시 시도"
      : `${activeTab.label} 복사`;
  const feedback = activeCopyState
    ? activeCopyState.result === "success"
      ? `클립보드에 복사했어요: ${activeCopyState.target === "install" ? "설치 명령" : activeTab.label}`
      : "클립보드 권한을 확인한 뒤 다시 시도해 주세요."
    : null;

  return (
    <section className="output-panel" id="export" aria-labelledby="output-title">
      <div className="workspace-heading output-heading">
        <div>
          <span className="eyebrow">STEP 4</span>
          <h2 id="output-title">프로젝트로 가져가기</h2>
        </div>
        <button
          className="copy-button"
          type="button"
          onClick={() => void copyText("output", output, outputFingerprint)}
        >
          {activeCopyState?.target === "output" && activeCopyState.result === "success" ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
          {outputCopyLabel}
        </button>
      </div>

      <div className="output-tabs" role="tablist" aria-label="출력 형식">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`output-tab-${tab.id}`}
            aria-controls={`output-panel-${tab.id}`}
            aria-selected={outputTab === tab.id}
            className={outputTab === tab.id ? "is-active" : ""}
            onClick={() => {
              setCopyState(null);
              setOutputTab(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {outputTab === "code" ? (
        <div className="install-command">
          <PackageOpen size={15} aria-hidden="true" />
          <code>{installCommand}</code>
          <button
            className="install-copy-button"
            type="button"
            onClick={() =>
              void copyText("install", installCommand, installFingerprint)
            }
          >
            {activeCopyState?.target === "install" && activeCopyState.result === "success" ? (
              <Check size={13} aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
            {activeCopyState?.target === "install" && activeCopyState.result === "success"
              ? "복사됨"
              : "명령 복사"}
          </button>
        </div>
      ) : null}

      <pre
        className="code-output"
        id={`output-panel-${outputTab}`}
        role="tabpanel"
        aria-labelledby={`output-tab-${outputTab}`}
        tabIndex={0}
      ><code>{output}</code></pre>
      <p
        className={`copy-feedback${activeCopyState?.result === "error" ? " is-error" : ""}`}
        aria-live="polite"
      >
        {feedback ?? " "}
      </p>
    </section>
  );
}
