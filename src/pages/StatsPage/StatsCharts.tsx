/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from "recharts";
import type { StatRow } from "../../types/statistics";
import { useMemo, useState } from "react";

type StatsChartsProps = {
  data: StatRow[];
  defaultX?: "date" | "hour";
};

const METRIC_KEYS: { key: keyof StatRow; label: string }[] = [
  { key: "wins", label: "Wins" },
  { key: "auctions", label: "Auctions" },
  { key: "bids", label: "Bids" },
  { key: "avg_cpm", label: "Avg eCPM" },
  { key: "win_rate", label: "Win Rate %" },
  { key: "unique_users", label: "Unique Users" },
];

export default function StatsCharts({ data, defaultX = "date" }: StatsChartsProps) {
  const [xKey, setXKey] = useState<"date" | "hour">(defaultX);
  const [seriesA, setSeriesA] = useState<keyof StatRow>("wins");
  const [seriesB, setSeriesB] = useState<keyof StatRow>("auctions");

  const filtered = useMemo(() => {
    if (xKey === "hour") return data.filter(d => d.hour);
    return data;
  }, [data, xKey]);

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">X axis:</label>
        <select value={xKey} onChange={(e) => setXKey(e.target.value as "date" | "hour")} className="border rounded px-2 py-1">
          <option value="date">date</option>
          <option value="hour">hour</option>
        </select>

        <label className="text-sm ml-4">Series A:</label>
        <select value={String(seriesA)} onChange={(e) => setSeriesA(e.target.value as keyof StatRow)} className="border rounded px-2 py-1">
          {METRIC_KEYS.map(m => <option key={String(m.key)} value={String(m.key)}>{m.label}</option>)}
        </select>

<label className="text-sm">Series B:</label>
        <select value={String(seriesB)} onChange={(e) => setSeriesB(e.target.value as keyof StatRow)} className="border rounded px-2 py-1">
          {METRIC_KEYS.map(m => <option key={String(m.key)} value={String(m.key)}>{m.label}</option>)}
        </select>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={seriesA as string} name={String(seriesA)} />
            <Bar dataKey={seriesB as string} name={String(seriesB)} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={seriesA as string} name={String(seriesA)} />
            <Line type="monotone" dataKey={seriesB as string} name={String(seriesB)} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
