export type DataValue = string | number | boolean | null;

export type DataRow = Record<string, DataValue>;

export type FieldKind = "quantitative" | "temporal" | "categorical" | "boolean";

export interface NumericSummary {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface FieldProfile {
  key: string;
  kind: FieldKind;
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
  samples: DataValue[];
  numeric?: NumericSummary;
}

export interface DataProfile {
  rowCount: number;
  fields: FieldProfile[];
}
