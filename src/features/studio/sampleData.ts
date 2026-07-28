import type { DataRow } from "@/src/core/data/types";

export const SAMPLE_ROWS: DataRow[] = [
  { month: "2025-01-01", product: "Atlas", revenue: 124000, profit: 28400, customers: 820 },
  { month: "2025-02-01", product: "Atlas", revenue: 139000, profit: 32600, customers: 910 },
  { month: "2025-03-01", product: "Atlas", revenue: 151000, profit: 35800, customers: 980 },
  { month: "2025-04-01", product: "Beacon", revenue: 146000, profit: 34100, customers: 960 },
  { month: "2025-05-01", product: "Beacon", revenue: 163000, profit: 40200, customers: 1080 },
  { month: "2025-06-01", product: "Beacon", revenue: 178000, profit: 44900, customers: 1180 },
  { month: "2025-07-01", product: "Canvas", revenue: 184000, profit: 47200, customers: 1240 },
  { month: "2025-08-01", product: "Canvas", revenue: 197000, profit: 51600, customers: 1320 },
  { month: "2025-09-01", product: "Canvas", revenue: 209000, profit: 54800, customers: 1410 },
  { month: "2025-10-01", product: "Delta", revenue: 218000, profit: 57300, customers: 1480 },
  { month: "2025-11-01", product: "Delta", revenue: 231000, profit: 61900, customers: 1580 },
  { month: "2025-12-01", product: "Delta", revenue: 248000, profit: 67400, customers: 1690 },
];

export const SAMPLE_CSV = `month,product,revenue,profit,customers
2025-01-01,Atlas,124000,28400,820
2025-02-01,Atlas,139000,32600,910
2025-03-01,Atlas,151000,35800,980
2025-04-01,Beacon,146000,34100,960
2025-05-01,Beacon,163000,40200,1080
2025-06-01,Beacon,178000,44900,1180
2025-07-01,Canvas,184000,47200,1240
2025-08-01,Canvas,197000,51600,1320
2025-09-01,Canvas,209000,54800,1410
2025-10-01,Delta,218000,57300,1480
2025-11-01,Delta,231000,61900,1580
2025-12-01,Delta,248000,67400,1690`;
