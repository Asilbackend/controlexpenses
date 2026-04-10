"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardCharts(props: {
  daySeries: { day: string; expense: number; income: number }[];
  categorySeries: { category: string; value: number }[];
  categoryColors?: Record<string, string>;
}) {
  const { daySeries, categorySeries, categoryColors } = props;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-black/10 bg-white p-4">
        <h3 className="text-sm font-semibold">Kunlar bo‘yicha</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daySeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="expense" name="Harajat" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="income" name="Tushum" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4">
        <h3 className="text-sm font-semibold">Kategoriya bo‘yicha (harajat)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Harajat" radius={[6, 6, 0, 0]}>
                {categorySeries.map((row, i) => (
                  <Cell key={row.category + i} fill={categoryColors?.[row.category] ?? "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
