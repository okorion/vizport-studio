"use client";

import dynamic from "next/dynamic";
import { Cpu, Gauge, ShieldCheck } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";

const ChartPreview = dynamic(
  () => import("@/src/features/studio/preview/ChartPreview").then((module) => module.ChartPreview),
  {
    ssr: false,
    loading: () => <div className="chart-loading">그래프 엔진을 준비하는 중…</div>,
  },
);

export function PreviewPanel() {
  const { rows, selectedSpec, profile, hasUnanalyzedChanges } = useStudioStore();

  if (hasUnanalyzedChanges) {
    return (
      <section className="workspace-empty workspace-pending" id="preview" aria-labelledby="preview-pending-title">
        <span className="eyebrow">STEP 3</span>
        <h2 id="preview-pending-title">미리보기 대기 중</h2>
        <p>STEP 1에서 변경사항을 분석하면 새 데이터의 그래프가 여기에 나타납니다.</p>
        <a href="#data">변경사항 분석하러 가기</a>
      </section>
    );
  }

  if (!selectedSpec) {
    return (
      <section className="workspace-empty" id="preview" aria-labelledby="preview-empty-title">
        <span className="eyebrow">STEP 3</span>
        <h2 id="preview-empty-title">미리보기 준비 중</h2>
        <p>추천 가능한 그래프가 없어요. 수치 필드가 포함된 데이터를 넣어 주세요.</p>
      </section>
    );
  }

  return (
    <section className="preview-panel" id="preview" aria-labelledby="preview-title">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">STEP 3</span>
          <h2 id="preview-title">미리보기</h2>
        </div>
        <div className="runtime-badges">
          <span><ShieldCheck size={14} aria-hidden="true" /> 로컬 데이터</span>
          <span><Cpu size={14} aria-hidden="true" /> Canvas</span>
          <span><Gauge size={14} aria-hidden="true" /> {profile.rowCount.toLocaleString()} points</span>
        </div>
      </div>

      {selectedSpec.renderer.preferred === "webgpu" ? (
        <p className="gpu-notice">
          이 데이터는 WebGPU 가속 후보입니다. 현재는 호환성이 높은 Canvas로 미리봅니다.
        </p>
      ) : null}

      <div className="chart-surface">
        <ChartPreview rows={rows} spec={selectedSpec} />
      </div>

      <div
        className="data-preview"
        role="region"
        aria-label="데이터 미리보기"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              {profile.fields.slice(0, 5).map((field) => (
                <th key={field.key}>{field.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 3).map((row, index) => (
              <tr key={index}>
                {profile.fields.slice(0, 5).map((field) => (
                  <td key={field.key}>{String(row[field.key] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
