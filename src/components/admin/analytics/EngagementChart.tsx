"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface EngagementChartProps {
  data: { name: string; value: number }[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-stone-400">
        Sem dados de atividade nos últimos 7 dias.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#81804E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#81804E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#81804E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Interações"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
