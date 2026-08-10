"use client";

import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";
import {
  loadCurrentProject,
  saveCurrentProject,
} from "@/src/integrations/storage/projectDb";

export function ProjectActions() {
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "load-error"
  >("idle");
  const {
    sourceName,
    inputText,
    intent,
    rows,
    selectedSpec,
    hasUnanalyzedChanges,
    restoreProject,
  } = useStudioStore();

  useEffect(() => {
    let active = true;
    void loadCurrentProject()
      .then((project) => {
        if (active && project && !useStudioStore.getState().hasUnanalyzedChanges) {
          restoreProject(project);
        }
      })
      .catch(() => {
        if (active) setStatus("load-error");
      });
    return () => {
      active = false;
    };
  }, [restoreProject]);

  async function save() {
    if (hasUnanalyzedChanges) return;
    setStatus("saving");
    try {
      await saveCurrentProject({
        sourceName,
        inputText,
        intent,
        rows,
        selectedSpec,
      });
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
    }
  }

  const label = hasUnanalyzedChanges
    ? "분석 후 저장"
    : status === "saving"
      ? "저장 중…"
      : status === "saved"
        ? "저장됨"
        : status === "load-error"
          ? "복원 실패 · 새로 저장"
        : status === "error"
          ? "저장 실패 · 다시 시도"
          : "로컬 저장";

  return (
    <button
      className="save-button"
      type="button"
      onClick={() => void save()}
      disabled={status === "saving" || hasUnanalyzedChanges}
      title={
        hasUnanalyzedChanges
          ? "변경사항을 먼저 분석해 주세요"
          : status === "load-error"
            ? "로컬 저장본을 불러오지 못했습니다. 현재 내용을 새로 저장할 수 있습니다."
            : undefined
      }
      aria-live="polite"
    >
      {status === "saved" ? <Check size={14} aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
      {label}
    </button>
  );
}
