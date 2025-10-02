import { useEffect, useState, type JSX } from "react";
import type { DimensionKey, FieldKey, Filters, StatRow } from "../../types/statistics";
import StatsCharts from "./StatsCharts";

type ReportResponse = {
  page: number;
  page_size: number;
  total: number;
  rows: StatRow[];
};

const API_BASE =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") || "";

const DEFAULT_FILTERS: Filters = {
  dateFrom: "2025-03-01",
  dateTo: "2025-03-31",
  report: "date",
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

async function fetchReport(
  dimensions: DimensionKey[],
  fields: FieldKey[],
  filters: Filters,
  page: number,
  pageSize: number
): Promise<ReportResponse> {
  const query = buildQuery({
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    dimensions: dimensions.join(","),
    fields: fields.join(","),
    page,
    page_size: pageSize,
  });
  const response = await fetch(`${API_BASE}/stat/report?${query}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<ReportResponse>;
}

export default function ChartsPage(): JSX.Element {
  const [filters] = useState<Filters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const dims: DimensionKey[] = ["date", "hour"];
    const fields: FieldKey[] = ["wins", "auctions", "bids", "avg_cpm", "win_rate", "unique_users"];
    setLoading(true);
    fetchReport(dims, fields, filters, 1, 2000)
      .then((res) => setRows(res.rows))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <h1 className="text-2xl font-semibold mb-4">Charts</h1>
      {loading ? (
        <div className="p-4">Loading…</div>
      ) : (
        <StatsCharts data={rows} defaultX="date" />
      )}
    </div>
  );
}