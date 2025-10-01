import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import type { StatRow } from "../../types/statistics";

type StatsChartsProps = {
  data: StatRow[];
};

export function StatsCharts({ data }: StatsChartsProps) {
  return (
    <div style={{ width: "100%", height: 400, marginTop: 32 }}>
      <h2>📈 CPM та CTR динаміка</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpm" stroke="#8884d8" name="CPM" />
          <Line type="monotone" dataKey="ctr" stroke="#82ca9d" name="CTR" />
        </LineChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: 40 }}>📊 Імпресії по годинах</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="impressions_good" fill="#8884d8" name="Impressions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
