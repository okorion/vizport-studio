import { extent, mean, median } from "d3-array";
import type {
  DataProfile,
  DataRow,
  DataValue,
  FieldKind,
  FieldProfile,
} from "@/src/core/data/types";

const DATE_PATTERN = /^\d{4}[-/.]\d{1,2}(?:[-/.]\d{1,2})?/;

function isMissing(value: DataValue | undefined): boolean {
  return value === null || value === undefined || value === "";
}

function asNumber(value: DataValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferKind(values: DataValue[]): FieldKind {
  if (values.length === 0) {
    return "categorical";
  }

  const booleanCount = values.filter(
    (value) =>
      typeof value === "boolean" ||
      (typeof value === "string" && /^(true|false)$/i.test(value)),
  ).length;
  if (booleanCount / values.length >= 0.9) {
    return "boolean";
  }

  const numericCount = values.filter((value) => asNumber(value) !== null).length;
  if (numericCount / values.length >= 0.9) {
    return "quantitative";
  }

  const temporalCount = values.filter(
    (value) =>
      typeof value === "string" &&
      DATE_PATTERN.test(value.trim()) &&
      Number.isFinite(Date.parse(value)),
  ).length;
  if (temporalCount / values.length >= 0.8) {
    return "temporal";
  }

  return "categorical";
}

function profileField(rows: DataRow[], key: string): FieldProfile {
  const presentValues = rows
    .map((row) => row[key])
    .filter((value): value is DataValue => !isMissing(value));
  const kind = inferKind(presentValues);
  const profile: FieldProfile = {
    key,
    kind,
    nonNullCount: presentValues.length,
    nullCount: rows.length - presentValues.length,
    uniqueCount: new Set(presentValues.map(String)).size,
    samples: Array.from(new Set(presentValues.map((value) => value))).slice(0, 4),
  };

  if (kind === "quantitative") {
    const numbers = presentValues
      .map(asNumber)
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);
    const [min, max] = extent(numbers);
    const average = mean(numbers);
    const middle = median(numbers);

    if (
      min !== undefined &&
      max !== undefined &&
      average !== undefined &&
      middle !== undefined
    ) {
      profile.numeric = { min, max, mean: average, median: middle };
    }
  }

  return profile;
}

export function profileData(rows: DataRow[]): DataProfile {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return {
    rowCount: rows.length,
    fields: keys.map((key) => profileField(rows, key)),
  };
}
