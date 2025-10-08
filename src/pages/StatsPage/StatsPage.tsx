/** biome-ignore lint/correctness/useExhaustiveDependencies: useEffect dependencies intentionally omitted */
/** biome-ignore-all lint/suspicious/noRedeclare: <explanation> */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import type {
  DimensionKey,
  FieldDef,
  FieldKey,
  Filters,
  ReportMode,
  StatRow,
  ViewTemplate,
} from "../../types/statistics";

type ReportResponse = {
  page: number;
  page_size: number;
  total: number;
  rows: StatRow[];
};


const API_BASE =
  ((import.meta.env?.VITE_BACKEND as string | undefined)) || "";


const ALL_FIELDS: FieldDef[] = [
  { key: "hour", label: "Hour" }, 
  { key: "unique_users", label: "Unique Users" },
  { key: "auctions", label: "Auctions" },
  { key: "bids", label: "Bids" },
  { key: "wins", label: "Wins" },
  { key: "win_rate", label: "Win Rate %" },
  { key: "avg_cpm", label: "Avg eCPM" },
];

const ALL_DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: "hour", label: "Hour" },
  { key: "event", label: "Event" },
  { key: "bidder", label: "Adapter" },
  { key: "creativeId", label: "Creative ID" },
  { key: "adUnitCode", label: "Ad Unit Code" },
  { key: "geo", label: "GEO" },
];

function monthRangeISO(d = new Date()) {
  const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

const DEFAULT_FILTERS: Filters = {
  dateFrom: monthRangeISO().from,
  dateTo: monthRangeISO().to,
  report: "date",
};

const LOCAL_STORAGE_VIEWS_KEY = "stats_views_v1";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
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

  const url = `${API_BASE}/stat/report?${query}`;

  const response = await fetch(url, { cache: "no-store", credentials: "omit" });
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
    "hour", // у запит не підемо з "hour" як метрикою, лише як колонкою у гріді
    "auctions",
    "bids",
    "wins",
    "win_rate",
    "avg_cpm",
    "unique_users",
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

  /** Стабільний loader + невеликий debounce у useEffect нижче */
  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchReport(
        selectedDimensions,
        selectedFields.filter((f) => f !== "hour"),
        filters,
        currentPage,
        pageSize
      );
      setReportRows(data.rows);
      setTotalRows(data.total);
    } catch (e) {
      console.error("Failed to load report:", e);
      setReportRows([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDimensions, selectedFields, filters, currentPage, pageSize]);

  /** Debounce запиту (уникаємо «петлі» та лавини запитів) */
  useEffect(() => {
    const t = setTimeout(() => {
      void loadReport();
    }, 250);
    return () => clearTimeout(t);
  }, [loadReport]);

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

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <h1 className="text-2xl font-semibold mb-3">Metrics</h1>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilters({ ...filters, dateFrom: e.target.value });
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => {
              setFilters({ ...filters, dateTo: e.target.value });
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1"
          />
        </div>
        <select
          value={filters.report}
          onChange={(e) => {
            setFilters({ ...filters, report: e.target.value as ReportMode });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="date">By Date</option>
          <option value="hour">By Hour</option>
        </select>

        <input
          placeholder="Event"
          value={filters.event || ""}
          onChange={(e) => {
            setFilters({ ...filters, event: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Bidder"
          value={filters.bidder || ""}
          onChange={(e) => {
            setFilters({ ...filters, bidder: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Creative ID"
          value={filters.creativeId || ""}
          onChange={(e) => {
            setFilters({ ...filters, creativeId: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="Ad Unit Code"
          value={filters.adUnitCode || ""}
          onChange={(e) => {
            setFilters({ ...filters, adUnitCode: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="GEO"
          value={filters.geo || ""}
          onChange={(e) => {
            setFilters({ ...filters, geo: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="CPM ≥"
          value={filters.cpmMin || ""}
          onChange={(e) => {
            setFilters({ ...filters, cpmMin: e.target.value });
            setCurrentPage(1);
          }}
          className="border rounded w-24 px-2 py-1"
        />
        <input
          placeholder="CPM ≤"
          value={filters.cpmMax || ""}
          onChange={(e) => {
            setFilters({ ...filters, cpmMax: e.target.value });
            setCurrentPage(1);
          }}
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
          <button
            type="button"
            onClick={saveCurrentView}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Save View
          </button>
          <select
            onChange={(e) => applyViewByName(e.target.value)}
            className="border rounded px-2 py-1"
          >
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
              {selectedDimensions.includes("creativeId") && (
                <th className="px-3 py-2 text-left">Creative ID</th>
              )}
              {selectedDimensions.includes("adUnitCode") && (
                <th className="px-3 py-2 text-left">Ad Unit Code</th>
              )}
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
                {selectedDimensions.includes("creativeId") && (
                  <td className="px-3 py-1">{row.creativeId ?? ""}</td>
                )}
                {selectedDimensions.includes("adUnitCode") && (
                  <td className="px-3 py-1">{row.adUnitCode ?? ""}</td>
                )}
                {selectedDimensions.includes("geo") && <td className="px-3 py-1">{row.geo ?? ""}</td>}
                {selectedFields
                  .filter((metric) => metric !== "hour")
                  .map((metric) => (
                    <td key={metric} className="px-3 py-1">
                      {row[metric as keyof StatRow] ?? ""}
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
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
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
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="border rounded px-2 py-1"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="border rounded px-2 py-1"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="border rounded px-2 py-1"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="border rounded px-2 py-1"
          >
            »
          </button>
        </div>

        <div className="flex gap-2">
          <a
            className="border rounded px-3 py-1"
            href={buildExportUrl(
              "csv",
              selectedDimensions,
              selectedFields.filter((f) => f !== "hour"),
              filters
            )}
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
          <a
            className="border rounded px-3 py-1"
            href={buildExportUrl(
              "xlsx",
              selectedDimensions,
              selectedFields.filter((f) => f !== "hour"),
              filters
            )}
            target="_blank"
            rel="noreferrer"
          >
            Export Excel
          </a>
        </div>
      </div>
    </div>
  );
}
