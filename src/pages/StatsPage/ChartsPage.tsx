import { useEffect, useMemo, useState, type JSX } from "react";
import type { DimensionKey, Filters, RawEvent, ReportMode, StatRow } from "../../types/statistics";
import StatsCharts from "./StatsCharts";

const ANALYTICS_LIST_URL = "/stat";

function toDateOnly(date: Date): string { return date.toISOString().slice(0, 10); }
function toHourOnly(date: Date): string { return `${String(date.getUTCHours()).padStart(2, "0")}:00`; }
function parseEventTime(value: string | number | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return new Date(value);
}

const DEFAULT_FILTERS: Filters = {
  dateFrom: "2025-03-01",
  dateTo:   "2025-03-31",
  report:   "date",
};

function filterRawEvents(rawEvents: RawEvent[], filters: Filters): RawEvent[] {
  const fromDate = new Date(filters.dateFrom + "T00:00:00.000Z");
  const toDate = new Date(filters.dateTo + "T23:59:59.999Z");
  return rawEvents.filter((eventItem) => {
    const ts = parseEventTime(eventItem.timestamp);
    if (ts < fromDate || ts > toDate) return false;
    return true;
  });
}

function aggregateRowsByDimensions(
  events: RawEvent[],
  reportMode: ReportMode,
  dimensions: DimensionKey[]
): StatRow[] {
  type Bucket = {
    dims: Partial<Record<DimensionKey, string>>;
    users: Set<string>;
    auctions: number;
    bids: number;
    wins: number;
    cpmSum: number;
    cpmCount: number;
  };

  const buckets = new Map<string, Bucket>();

  for (const e of events) {
    const dt = parseEventTime(e.timestamp);
    const dateStr = toDateOnly(dt);
    const hourStr = reportMode === "hour" && dimensions.includes("hour") ? toHourOnly(dt) : undefined;

    const dimValues: Partial<Record<DimensionKey, string>> = { date: dateStr };
    if (hourStr) dimValues.hour = hourStr;

    const key = [dateStr, hourStr ?? ""].join("|");
    const bucket =
      buckets.get(key) ??
      { dims: dimValues, users: new Set<string>(), auctions: 0, bids: 0, wins: 0, cpmSum: 0, cpmCount: 0 };

    if (e.userId) bucket.users.add(e.userId);
    if (e.event === "auctionInit") bucket.auctions += 1;
    if (e.event === "bidResponse") bucket.bids += 1;
    if (e.event === "bidWon") {
      bucket.wins += 1;
      if (typeof e.cpm === "number") { bucket.cpmSum += e.cpm; bucket.cpmCount += 1; }
    }

    buckets.set(key, bucket);
  }

  const rows: StatRow[] = [];
  for (const b of buckets.values()) {
    rows.push({
      date: b.dims.date!,
      hour: b.dims.hour,
      unique_users: b.users.size,
      auctions: b.auctions,
      bids: b.bids,
      wins: b.wins,
      win_rate: b.auctions ? +(b.wins / b.auctions * 100).toFixed(2) : 0,
      avg_cpm: b.cpmCount ? +(b.cpmSum / b.cpmCount).toFixed(3) : 0,
    });
  }
  rows.sort((a, b) => (a.date + (a.hour ?? "")).localeCompare(b.date + (b.hour ?? "")));
  return rows;
}

export default function ChartsPage(): JSX.Element {
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [filters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    (async () => {
      const res = await fetch(ANALYTICS_LIST_URL);
      const payload: RawEvent[] = await res.json();
      setRawEvents(payload);
    })();
  }, []);

  const reportRows = useMemo(() => {
    const filtered = filterRawEvents(rawEvents, filters);
    return aggregateRowsByDimensions(filtered, filters.report, ["hour"]);
  }, [rawEvents, filters]);

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <h1 className="text-2xl font-semibold mb-4">Charts</h1>
      <StatsCharts data={reportRows} defaultX="date" />
    </div>
  );
}
