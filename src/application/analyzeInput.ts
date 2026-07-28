import { createVisualization } from "@/src/application/createVisualization";
import type { VisualizationIntent } from "@/src/core/viz-spec/schema";
import {
  readDataFile,
  readDataText,
} from "@/src/integrations/data-readers/readData";

export async function analyzeTextInput(
  text: string,
  intent: VisualizationIntent,
) {
  const parsed = await readDataText(text);
  return { ...parsed, ...createVisualization(parsed.rows, intent) };
}

export async function analyzeFileInput(
  file: File,
  intent: VisualizationIntent,
) {
  const parsed = await readDataFile(file);
  return { ...parsed, ...createVisualization(parsed.rows, intent) };
}
