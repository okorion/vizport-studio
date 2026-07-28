import type { DataProfile, DataRow } from "@/src/core/data/types";
import type { VizSpec } from "@/src/core/viz-spec/schema";

export function buildImplementationPrompt(
  spec: VizSpec,
  profile: DataProfile,
  rows: DataRow[],
): string {
  const dataContract = profile.fields.map((field) => ({
    name: field.key,
    type: field.kind,
    nullable: field.nullCount > 0,
    examples: field.samples,
  }));

  return `# Visualization implementation request

Create a reusable React + TypeScript chart component using Apache ECharts.

## Visualization specification

\`\`\`json
${JSON.stringify(spec, null, 2)}
\`\`\`

## Data contract

\`\`\`json
${JSON.stringify(dataContract, null, 2)}
\`\`\`

## Example rows

\`\`\`json
${JSON.stringify(rows.slice(0, 5), null, 2)}
\`\`\`

## Constraints

- Accept data through a typed prop; do not hardcode production data.
- Keep data transformation separate from React rendering.
- Make the chart responsive with ResizeObserver and dispose it on unmount.
- Include an accessible text summary and do not rely on color alone.
- Preserve the field mappings and intent in the specification.
- Return the install command and the complete component in separate code blocks.
`;
}
