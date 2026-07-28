import Dexie, { type EntityTable } from "dexie";
import type { DataRow } from "@/src/core/data/types";
import type {
  VisualizationIntent,
  VizSpec,
} from "@/src/core/viz-spec/schema";

export interface SavedProject {
  id: "current";
  updatedAt: string;
  sourceName: string;
  inputText: string;
  intent: VisualizationIntent;
  rows: DataRow[];
  selectedSpec: VizSpec | null;
}

const db = new Dexie("vizport-studio") as Dexie & {
  projects: EntityTable<SavedProject, "id">;
};

db.version(1).stores({
  projects: "id, updatedAt",
});

export async function saveCurrentProject(
  project: Omit<SavedProject, "id" | "updatedAt">,
): Promise<SavedProject> {
  const saved: SavedProject = {
    ...project,
    id: "current",
    updatedAt: new Date().toISOString(),
  };
  await db.projects.put(saved);
  return saved;
}

export function loadCurrentProject(): Promise<SavedProject | undefined> {
  return db.projects.get("current");
}
