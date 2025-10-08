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
import "./StatsPage.css";
type ReportResponse = {
  page: number;
  page_size: number;
  total: number;
  rows: StatRow[];
};


const API_BASE = import.meta.env.VITE_BACKEND;


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
    "hour", 
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
  <div className="stats-container">
    {/* Header */}
    <div className="stats-header">
      <h1 className="stats-title">Metrics</h1>
      <div className="stats-status">{isLoading ? "Refreshing…" : "Ready"}</div>
    </div>

    {/* Toolbar / Filters */}
    <div className="card toolbar">
      <div className="filters-grid">
        <label className="filter-field">
          <span className="filter-label">From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilters({ ...filters, dateFrom: e.target.value });
              setCurrentPage(1);
            }}
            className="input"
          />
        </label>

        <label className="filter-field">
          <span className="filter-label">To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => {
              setFilters({ ...filters, dateTo: e.target.value });
              setCurrentPage(1);
            }}
            className="input"
          />
        </label>

        <label className="filter-field">
          <span className="filter-label">Group</span>
          <select
            value={filters.report}
            onChange={(e) => {
              setFilters({ ...filters, report: e.target.value as ReportMode });
              setCurrentPage(1);
            }}
            className="select"
          >
            <option value="date">By Date</option>
            <option value="hour">By Hour</option>
          </select>
        </label>

        <div className="toolbar-actions">
          <button
            type="button"
            onClick={() => void loadReport()}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Reload"}
          </button>
        </div>
      </div>

      <div className="filters-quick">
        <input
          placeholder="Event"
          value={filters.event || ""}
          onChange={(e) => {
            setFilters({ ...filters, event: e.target.value });
            setCurrentPage(1);
          }}
          className="input"
        />
        <input
          placeholder="Bidder"
          value={filters.bidder || ""}
          onChange={(e) => {
            setFilters({ ...filters, bidder: e.target.value });
            setCurrentPage(1);
          }}
          className="input"
        />
        <input
          placeholder="Creative ID"
          value={filters.creativeId || ""}
          onChange={(e) => {
            setFilters({ ...filters, creativeId: e.target.value });
            setCurrentPage(1);
          }}
          className="input"
        />
        <input
          placeholder="Ad Unit Code"
          value={filters.adUnitCode || ""}
          onChange={(e) => {
            setFilters({ ...filters, adUnitCode: e.target.value });
            setCurrentPage(1);
          }}
          className="input"
        />
        <input
          placeholder="GEO"
          value={filters.geo || ""}
          onChange={(e) => {
            setFilters({ ...filters, geo: e.target.value });
            setCurrentPage(1);
          }}
          className="input"
        />

        <div className="filter-row">
          <input
            placeholder="CPM ≥"
            value={filters.cpmMin || ""}
            onChange={(e) => {
              setFilters({ ...filters, cpmMin: e.target.value });
              setCurrentPage(1);
            }}
            className="input"
          />
          <input
            placeholder="CPM ≤"
            value={filters.cpmMax || ""}
            onChange={(e) => {
              setFilters({ ...filters, cpmMax: e.target.value });
              setCurrentPage(1);
            }}
            className="input"
          />
        </div>

        <div className="view-actions">
          <input
            placeholder="View name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="input"
          />
          <button
            type="button"
            onClick={saveCurrentView}
            className="btn"
          >
            Save View
          </button>
          <select
            onChange={(e) => applyViewByName(e.target.value)}
            className="select"
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
    </div>

    {/* Dimensions */}
    <div className="card">
      <div className="section-title">Dimensions</div>
      <div className="chips">
        {ALL_DIMENSIONS.map((dim) => {
          const active = selectedDimensions.includes(dim.key);
          return (
            <button
              type="button"
              key={dim.key}
              onClick={() => toggleDimension(dim.key)}
              className={`chip ${active ? "chip--active-sky" : ""}`}
            >
              {dim.label}
            </button>
          );
        })}
      </div>
    </div>

    {/* Fields */}
    <div className="card">
      <div className="section-title">Metrics</div>
      <div className="chips">
        {ALL_FIELDS.map((field) => {
          const active = selectedFields.includes(field.key);
          return (
            <button
              type="button"
              key={field.key}
              onClick={() => toggleField(field.key)}
              className={`chip ${active ? "chip--active-indigo" : ""}`}
            >
              {field.label}
            </button>
          );
        })}
      </div>
    </div>

    {/* Table */}
    <div className="card table-card">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-indicator">Loading data…</div>
        </div>
      )}

      <div className="table-scroll">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Date</th>
              {selectedDimensions.includes("hour") && <th>Hour</th>}
              {selectedDimensions.includes("event") && <th>Event</th>}
              {selectedDimensions.includes("bidder") && <th>Adapter</th>}
              {selectedDimensions.includes("creativeId") && <th>Creative ID</th>}
              {selectedDimensions.includes("adUnitCode") && <th>Ad Unit Code</th>}
              {selectedDimensions.includes("geo") && <th>GEO</th>}
              {selectedFields
                .filter((metric) => metric !== "hour")
                .map((metric) => (
                  <th key={metric}>
                    {ALL_FIELDS.find((f) => f.key === metric)?.label ?? metric}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && !isLoading ? (
              <tr>
                <td className="empty-cell" colSpan={7 + selectedFields.length}>
                  No data for selected filters.
                </td>
              </tr>
            ) : (
              reportRows.map((row, idx) => (
                <tr
                  key={`${row.date}-${row.hour ?? ""}-${row.bidder ?? ""}-${row.creativeId ?? ""}-${idx}`}
                >
                  <td>{row.date}</td>
                  {selectedDimensions.includes("hour") && <td>{row.hour ?? ""}</td>}
                  {selectedDimensions.includes("event") && <td>{row.event ?? ""}</td>}
                  {selectedDimensions.includes("bidder") && <td>{row.bidder ?? ""}</td>}
                  {selectedDimensions.includes("creativeId") && <td>{row.creativeId ?? ""}</td>}
                  {selectedDimensions.includes("adUnitCode") && <td>{row.adUnitCode ?? ""}</td>}
                  {selectedDimensions.includes("geo") && <td>{row.geo ?? ""}</td>}
                  {selectedFields
                    .filter((metric) => metric !== "hour")
                    .map((metric) => (
                      <td key={metric} className="num">
                        {row[metric as keyof StatRow] ?? ""}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination / Export */}
      <div className="table-footer">
        <div className="page-size">
          <span>Page Size</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="select"
          >
            {[25, 50, 100, 200, 500].map((sizeOption) => (
              <option key={sizeOption} value={sizeOption}>
                {sizeOption}
              </option>
            ))}
          </select>

          <span className="muted">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> •{" "}
            <strong>{totalRows.toLocaleString()}</strong> rows
          </span>
        </div>

        <div className="pager">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="btn"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="btn"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="btn"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="btn"
          >
            »
          </button>
        </div>

        <div className="export-actions">
          <a
            className="btn"
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
            className="btn"
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
  </div>
);


}
