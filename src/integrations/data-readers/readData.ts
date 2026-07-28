import Papa, { type ParseError } from "papaparse";
import type { DataRow, DataValue } from "@/src/core/data/types";

export const MAX_PREVIEW_ROWS = 50_000;

export interface ReadDataResult {
  rows: DataRow[];
  warnings: string[];
  format: "csv" | "json";
}

function toDataValue(value: unknown): DataValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value === undefined) return null;
  return JSON.stringify(value);
}

function normalizeRows(rows: Record<string, unknown>[]): DataRow[] {
  return rows
    .filter((row) => Object.keys(row).length > 0)
    .slice(0, MAX_PREVIEW_ROWS)
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.trim(), toDataValue(value)]),
      ),
    );
}

function warningMessages(errors: ParseError[], originalCount: number): string[] {
  const warnings = errors.slice(0, 3).map((error) => {
    const row = typeof error.row === "number" ? ` (${error.row + 1}행)` : "";
    return `${error.message}${row}`;
  });

  if (originalCount > MAX_PREVIEW_ROWS) {
    warnings.push(
      `빠른 미리보기를 위해 처음 ${MAX_PREVIEW_ROWS.toLocaleString()}행만 사용했어요.`,
    );
  }

  return warnings;
}

function parseCsvText(text: string): Promise<ReadDataResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: "greedy",
      complete(result) {
        const rows = normalizeRows(result.data);
        if (rows.length === 0) {
          reject(new Error("헤더와 데이터가 포함된 CSV를 입력해 주세요."));
          return;
        }

        resolve({
          rows,
          warnings: warningMessages(result.errors, result.data.length),
          format: "csv",
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}

function parseJsonText(text: string): ReadDataResult {
  const parsed: unknown = JSON.parse(text);
  const parsedRecord =
    typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  const source = Array.isArray(parsed)
    ? parsed
    : parsedRecord && Array.isArray(parsedRecord.data)
      ? parsedRecord.data
      : null;

  if (
    !source ||
    source.some((row: unknown) => typeof row !== "object" || row === null)
  ) {
    throw new Error("JSON은 객체 배열 또는 { data: 객체 배열 } 형태여야 해요.");
  }

  const rows = normalizeRows(source as Record<string, unknown>[]);
  if (rows.length === 0) {
    throw new Error("JSON 배열에 한 개 이상의 데이터 객체가 필요해요.");
  }

  return {
    rows,
    warnings:
      source.length > MAX_PREVIEW_ROWS
        ? [`빠른 미리보기를 위해 처음 ${MAX_PREVIEW_ROWS.toLocaleString()}행만 사용했어요.`]
        : [],
    format: "json",
  };
}

export async function readDataText(text: string): Promise<ReadDataResult> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("분석할 데이터를 입력해 주세요.");

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJsonText(trimmed);
  }

  return parseCsvText(trimmed);
}

export async function readDataFile(file: File): Promise<ReadDataResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "json") {
    return parseJsonText(await file.text());
  }

  if (extension !== "csv" && extension !== "tsv") {
    throw new Error("현재는 CSV, TSV, JSON 파일을 지원해요.");
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: "greedy",
      delimiter: extension === "tsv" ? "\t" : "",
      worker: true,
      complete(result) {
        const rows = normalizeRows(result.data);
        if (rows.length === 0) {
          reject(new Error("헤더와 데이터가 포함된 파일을 선택해 주세요."));
          return;
        }

        resolve({
          rows,
          warnings: warningMessages(result.errors, result.data.length),
          format: "csv",
        });
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}
