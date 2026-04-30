"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IProps {
  data: Array<{ name: string; count: number }>;
}

const BarbersChart = ({ data }: IProps) => {
  if (data.length === 0) {
    return (
      <p className="text-center text-[11px] text-gray-500 py-8">
        Sem dados de barbeiros nos últimos 7 dias
      </p>
    );
  }

  return (
    <div style={{ height: Math.max(120, data.length * 36) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--secondary))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [Number(value), "Agendamentos"]}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarbersChart;
