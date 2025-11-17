"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;
const COLORS = ["#34d399", "#f97316", "#facc15", "#60a5fa", "#22d3ee"];

type Props = {
  profiles: Array<Record<string, number>>;
};

export function TeamElementPie({ profiles }: Props) {
  const data = useMemo(() => {
    if (!profiles.length) return [];
    const totals = ELEMENT_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<string, number>);

    profiles.forEach((profile) => {
      ELEMENT_KEYS.forEach((key) => {
        totals[key] += profile[key] ?? 0;
      });
    });

    return ELEMENT_KEYS.map((key) => ({
      name: key.toUpperCase(),
      value: Number((totals[key] / profiles.length).toFixed(3)),
    }));
  }, [profiles]);

  if (!data.length) {
    return <p className="text-sm text-slate-500">팀 데이터가 없습니다.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
