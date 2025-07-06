"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip
} from "recharts";

export default function Home() {
  const [data, setData] = useState<{ weapon: string; appearances: number; wins: number; winRate: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/weapon-winrates")
      .then(r => r.json())
      .then(json => setData(json.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
  if (!data.length) return <p className="p-8">Loading…</p>;

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-6">Albion Online – Weapon ZvZ Win Rates</h1>
      <div className="bg-gray-800 rounded-2xl shadow-lg mb-10 p-4">
        <ResponsiveContainer width="100%" height={450}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="appearances" name="Appearances" tick={{ fill: "#fff" }} type="number" />
            <YAxis
              dataKey="winRate"
              name="Win Rate"
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fill: "#fff" }}
              type="number"
            />
            <ZAxis dataKey="wins" range={[60, 400]} name="Wins" />
            <Tooltip
              formatter={(value, name) => 
                name === "winRate" ? [`${(value as number * 100).toFixed(1)}%`, "Win Rate"] : [value, name]}
            />
            <Scatter name="Weapon" data={data} fill="#38bdf8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}