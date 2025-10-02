/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import { useEffect, useMemo, useState, type JSX } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from "recharts";
import type {
  DimensionKey,
  FieldDef,
  FieldKey,
  Filters,
  IndexableStatRow,
  ReportMode,
  StatRow,
  ViewTemplate,
  ExportPrimitive,
  ExportRow,
} from "../../types/statistics";

type ReportResponse = {
  page: number;
  page_size: number;
  total: number;
  rows: StatRow[];
};

const API_BASE =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") || "";

const ALL_FIELDS: FieldDef[] = [
  { key: "hour",         label: "Hour" },
  { key: "unique_users", label: "Unique Users" },
  { key: "auctions",     label: "Auctions" },
  { key: "bids",         label: "Bids" },
  { key: "wins",         label: "Wins" },
  { key: "win_rate",     label: "Win Rate %" },
  { key: "avg_cpm",      label: "Avg eCPM" },
];

const ALL_DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: "hour",       label: "Hour" },
  { key: "event",      label: "Event" },
  { key: "bidder",     label: "Adapter" },
  { key: "creativeId", label: "Creative ID" },
  { key: "adUnitCode", label: "Ad Unit Code" },
  { key: "geo",        label: "GEO" },
];

const DEFAULT_FILTERS: Filters = {
  dateFrom: "2025-03-01",
  dateTo:   "2025-03-31",
  report:   "date",
};

const LOCAL_STORAGE_VIEWS_KEY = "stats_views_v1";

function formatNumber(value: ExportPrimitive): string {
  if (value == null) return "";
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function rowsToCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";
  const headerKeys = Object.keys(rows[0]);
  const escapeCell = (cell: ExportPrimitive) => `"${formatNumber(cell).replace(/"/g, '""')}"`;
  const headerLine = headerKeys.map((k) => `"${k.replace(/"/g, '""')}"`).join(",");
  const dataLines = rows.map((row) => headerKeys.map((k) => escapeCell(row[k])).join(","));
  return [headerLine, ...dataLines].join("\n");
}

async function downloadCsv(filename: string, rows: ExportRow[]): Promise<void> {
  const csvText = rowsToCsv(rows);
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function downloadExcel(filename: string, rows: ExportRow[]): Promise<void> {
  try {
    const xlsx: typeof import("xlsx") = await import("xlsx");
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Report");
    xlsx.writeFile(workbook, filename);
  } catch {
    await downloadCsv(filename.replace(/\.xlsx$/i, ".csv"), rows);
  }
}

function toExportRows(reportRows: StatRow[]): ExportRow[] {
  return reportRows.map((row) => {
    const indexable = row as unknown as IndexableStatRow;
    const result: ExportRow = {};
    Object.keys(indexable).forEach((key) => {
      result[key] = indexable[key];
    });
    return result;
  });
}

function getCellValue(row: StatRow, key: string): ExportPrimitive {
  const indexable = row as unknown as IndexableStatRow;
  return indexable[key];
}

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
    event: filters.event,
    bidder: filters.bidder,
    creativeId: filters.creativeId,
    adUnitCode: filters.adUnitCode,
    geo: filters.geo,
    cpm_min: filters.cpmMin ? Number(filters.cpmMin) : undefined,
    cpm_max: filters.cpmMax ? Number(filters.cpmMax) : undefined,
    page,
    page_size: pageSize,
  });

  const response = await fetch(`${API_BASE}/stat/report?${query}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<ReportResponse>;
}

function buildExportUrl(
  format: "csv" | "xlsx",
  dimensions: DimensionKey[],
  fields: FieldKey[],
  filters: Filters
): string {
  const query = buildQuery({
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    dimensions: dimensions.join(","),
    fields: fields.join(","),
    event: filters.event,
    bidder: filters.bidder,
    creativeId: filters.creativeId,
    adUnitCode: filters.adUnitCode,
    geo: filters.geo,
    cpm_min: filters.cpmMin,
    cpm_max: filters.cpmMax,
  });
  return `${API_BASE}/stat/export.${format}?${query}`;
}

export default function StatsPage(): JSX.Element {
  const [selectedDimensions, setSelectedDimensions] = useState<DimensionKey[]>(["hour", "bidder"]);
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>([
    "hour", "auctions", "bids", "wins", "win_rate", "avg_cpm", "unique_users",
  ]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const [reportRows, setReportRows] = useState<StatRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const [savedViews, setSavedViews] = useState<ViewTemplate[]>(
    JSON.parse(localStorage.getItem(LOCAL_STORAGE_VIEWS_KEY) || "[]")
  );
  const [viewName, setViewName] = useState<string>("");

  async function loadReport(): Promise<void> {
    setIsLoading(true);
    try {
      const data = await fetchReport(
        selectedDimensions,
        selectedFields.filter((f) => f !== "hour"),
        filters,
        currentPage,
        pageSize
      );
      setReportRows(data.rows);
      setTotalRows(data.total);
    } catch (error) {
      console.error("Failed to load report:", error);
      setReportRows([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDimensions, selectedFields, filters, currentPage, pageSize, loadReport]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRows / pageSize)),
    [totalRows, pageSize]
  );

  function toggleField(fieldKey: FieldKey): void {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey]
    );
    setCurrentPage(1);
  }

  function toggleDimension(dimension: DimensionKey): void {
    setSelectedDimensions((prev) =>
      prev.includes(dimension) ? prev.filter((d) => d !== dimension) : [...prev, dimension]
    );
    setCurrentPage(1);
  }

  function saveCurrentView(): void {
    if (!viewName.trim()) return;
    const view: ViewTemplate = {
      name: viewName.trim(),
      dimensions: selectedDimensions,
      fields: selectedFields,
      filters,
      pageSize,
    };
    const next = [...savedViews.filter((v) => v.name !== view.name), view];
    setSavedViews(next);
    localStorage.setItem(LOCAL_STORAGE_VIEWS_KEY, JSON.stringify(next));
  }

  function applyViewByName(name: string): void {
    const view = savedViews.find((v) => v.name === name);
    if (!view) return;
    setSelectedDimensions(view.dimensions);
    setSelectedFields(view.fields);
    setFilters(view.filters);
    setPageSize(view.pageSize);
    setViewName(view.name);
    setCurrentPage(1);
  }

  const chartData = reportRows;

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <h1 className="text-2xl font-semibold mb-3">Metrics</h1>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setCurrentPage(1); }}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setCurrentPage(1); }}
            className="border rounded px-2 py-1"
          />
        </div>
        <select
          value={filters.report}
          onChange={(e) => { setFilters({ ...filters, report: e.target.value as ReportMode }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        >
          <option value="date">By Date</option>
          <option value="hour">By Hour</option>
        </select>

        <input
          placeholder="Event"
          value={filters.event || ""}
          onChange={(e) => { setFilters({ ...filters, event: e.target.value }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Bidder"
          value={filters.bidder || ""}
          onChange={(e) => { setFilters({ ...filters, bidder: e.target.value }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Creative ID"
          value={filters.creativeId || ""}
          onChange={(e) => { setFilters({ ...filters, creativeId: e.target.value }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Ad Unit Code"
          value={filters.adUnitCode || ""}
          onChange={(e) => { setFilters({ ...filters, adUnitCode: e.target.value }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="GEO"
          value={filters.geo || ""}
          onChange={(e) => { setFilters({ ...filters, geo: e.target.value }); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="CPM ≥"
          value={filters.cpmMin || ""}
          onChange={(e) => { setFilters({ ...filters, cpmMin: e.target.value }); setCurrentPage(1); }}
          className="border rounded w-24 px-2 py-1"
        />
        <input
          placeholder="CPM ≤"
          value={filters.cpmMax || ""}
          onChange={(e) => { setFilters({ ...filters, cpmMax: e.target.value }); setCurrentPage(1); }}
          className="border rounded w-24 px-2 py-1"
        />

        <button
          type="button"
          onClick={() => void loadReport()}
          className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Loading…" : "Reload"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <input
            placeholder="View name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button type="button" onClick={saveCurrentView} className="bg-blue-600 text-white px-3 py-1 rounded">
            Save View
          </button>
          <select onChange={(e) => applyViewByName(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Select View</option>
            {savedViews.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {ALL_DIMENSIONS.map((dim) => (
          <button
            type="button"
            key={dim.key}
            onClick={() => toggleDimension(dim.key)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedDimensions.includes(dim.key)
                ? "bg-sky-100 border-sky-400"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            {selectedDimensions.includes(dim.key) ? "●" : "○"} {dim.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_FIELDS.map((field) => (
          <button
            type="button"
            key={field.key}
            onClick={() => toggleField(field.key)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedFields.includes(field.key)
                ? "bg-indigo-100 border-indigo-400"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            {selectedFields.includes(field.key) ? "●" : "○"} {field.label}
          </button>
        ))}
      </div>

      <div className="overflow-auto rounded border mb-3">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>

              {selectedDimensions.includes("hour") && <th className="px-3 py-2 text-left">Hour</th>}
              {selectedDimensions.includes("event") && <th className="px-3 py-2 text-left">Event</th>}
              {selectedDimensions.includes("bidder") && <th className="px-3 py-2 text-left">Adapter</th>}
              {selectedDimensions.includes("creativeId") && <th className="px-3 py-2 text-left">Creative ID</th>}
              {selectedDimensions.includes("adUnitCode") && <th className="px-3 py-2 text-left">Ad Unit Code</th>}
              {selectedDimensions.includes("geo") && <th className="px-3 py-2 text-left">GEO</th>}

              {selectedFields
                .filter((metric) => metric !== "hour")
                .map((metric) => (
                  <th key={metric} className="px-3 py-2 text-left">
                    {ALL_FIELDS.find((f) => f.key === metric)?.label ?? metric}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row, idx) => (
              <tr
                key={`${row.date}-${row.hour ?? ""}-${row.bidder ?? ""}-${row.creativeId ?? ""}-${idx}`}
                className="border-t"
              >
                <td className="px-3 py-1">{row.date}</td>
                {selectedDimensions.includes("hour") && <td className="px-3 py-1">{row.hour ?? ""}</td>}
                {selectedDimensions.includes("event") && <td className="px-3 py-1">{row.event ?? ""}</td>}
                {selectedDimensions.includes("bidder") && <td className="px-3 py-1">{row.bidder ?? ""}</td>}
                {selectedDimensions.includes("creativeId") && <td className="px-3 py-1">{row.creativeId ?? ""}</td>}
                {selectedDimensions.includes("adUnitCode") && <td className="px-3 py-1">{row.adUnitCode ?? ""}</td>}
                {selectedDimensions.includes("geo") && <td className="px-3 py-1">{row.geo ?? ""}</td>}

                {selectedFields
                  .filter((metric) => metric !== "hour")
                  .map((metric) => (
                    <td key={metric} className="px-3 py-1">
                      {formatNumber(getCellValue(row, metric))}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm">Page Size:</span>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          className="border rounded px-2 py-1"
        >
          {[25, 50, 100, 200, 500].map((sizeOption) => (
            <option key={sizeOption} value={sizeOption}>
              {sizeOption}
            </option>
          ))}
        </select>
        <span className="ml-4 text-sm">
          Page {currentPage} of {totalPages} • {totalRows.toLocaleString()} rows
        </span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1} className="border rounded px-2 py-1">«</button>
          <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="border rounded px-2 py-1">‹</button>
          <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="border rounded px-2 py-1">›</button>
          <button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="border rounded px-2 py-1">»</button>
        </div>
        <div className="flex gap-2">
          <a
            className="border rounded px-3 py-1"
            href={buildExportUrl("csv", selectedDimensions, selectedFields.filter((f) => f !== "hour"), filters)}
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
          <a
            className="border rounded px-3 py-1"
            href={buildExportUrl("xlsx", selectedDimensions, selectedFields.filter((f) => f !== "hour"), filters)}
            target="_blank"
            rel="noreferrer"
          >
            Export Excel
          </a>
        </div>
      </div>

      {/* <h2 className="text-lg font-semibold mb-2">Wins & Auctions</h2>
      <div className="h-72 w-full mb-8">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="wins" />
            <Bar dataKey="auctions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-lg font-semibold mb-2">Avg eCPM</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avg_cpm" />
          </LineChart>
        </ResponsiveContainer>
      </div> */}
    </div>
  );
}
