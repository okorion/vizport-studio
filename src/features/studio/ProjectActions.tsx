"use client";

import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";
import {
  loadCurrentProject,
  saveCurrentProject,
} from "@/src/integrations/storage/projectDb";

export function ProjectActions() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const {
    sourceName,
    inputText,
    intent,
    rows,
    selectedSpec,
    restoreProject,
  } = useStudioStore();

  useEffect(() => {
    let active = true;
    void loadCurrentProject().then((project) => {
      if (active && project) restoreProject(project);
    });
    return () => {
      active = false;
    };
  }, [restoreProject]);

  async function save() {
    setStatus("saving");
    await saveCurrentProject({
      sourceName,
      inputText,
      intent,
      rows,
      selectedSpec,
    });
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  return (
    <button className="save-button" type="button" onClick={() => void save()} disabled={status === "saving"}>
      {status === "saved" ? <Check size={14} aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
      {status === "saving" ? "저장 중…" : status === "saved" ? "저장됨" : "로컬 저장"}
    </button>
  );
}
