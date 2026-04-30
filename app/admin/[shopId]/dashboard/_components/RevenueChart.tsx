"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IProps {
  data: Array<{ label: string; revenue: number; count: number }>;
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const RevenueChart = ({ data }: IProps) => {
  const empty = data.every((d) => d.revenue === 0);
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  if (empty) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-xs text-gray-500">Sem receita registrada nos últimos 7 dias.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-2xl font-bold tracking-tight leading-none">{formatBRL(total)}</p>
      <p className="text-[11px] text-gray-500">total no período</p>
      <div className="h-40 -ml-2 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--secondary))" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              width={44}
              tickFormatter={(v) => (v === 0 ? "0" : `R$${v}`)}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--secondary))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [formatBRL(Number(value)), "Receita"]}
              labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
