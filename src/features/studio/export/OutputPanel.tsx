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

export function OutputPanel() {
  const { selectedSpec, rows, profile, outputTab, setOutputTab } = useStudioStore();
  const [copied, setCopied] = useState(false);

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

  if (!selectedSpec) return null;

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="output-panel" aria-labelledby="output-title">
      <div className="workspace-heading output-heading">
        <div>
          <span className="eyebrow">STEP 4</span>
          <h2 id="output-title">프로젝트로 가져가기</h2>
        </div>
        <button className="copy-button" type="button" onClick={() => void copyOutput()}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? "복사됨" : "전체 복사"}
        </button>
      </div>

      <div className="output-tabs" role="tablist" aria-label="출력 형식">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={outputTab === tab.id}
            className={outputTab === tab.id ? "is-active" : ""}
            onClick={() => setOutputTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {outputTab === "code" ? (
        <div className="install-command">
          <PackageOpen size={15} aria-hidden="true" />
          <code>{buildInstallCommand(selectedSpec)}</code>
        </div>
      ) : null}

      <pre className="code-output"><code>{output}</code></pre>
    </section>
  );
}
