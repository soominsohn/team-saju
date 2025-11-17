"use client";

import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;

type Member = {
  memberId?: string;
  displayName: string;
  profile: Record<string, number>;
};

type Props = {
  members: Member[];
};

export function MemberRadar({ members }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const data = useMemo(() => {
    if (!members.length) return [];
    const profile = members[selectedIndex] ? members[selectedIndex].profile : members[0].profile;
    return ELEMENT_KEYS.map((key) => ({ element: key.toUpperCase(), value: profile[key] ?? 0 }));
  }, [members, selectedIndex]);

  if (!members.length) {
    return <p className="text-sm text-slate-500">멤버 데이터가 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {members.map((member, index) => (
          <button
            key={member.memberId ?? member.displayName}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`px-3 py-1 text-sm rounded-full border ${
              index === selectedIndex ? "bg-indigo-100 border-indigo-500" : "border-slate-300"
            }`}
          >
            {member.displayName}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius={90}>
          <PolarGrid />
          <PolarAngleAxis dataKey="element" />
          <PolarRadiusAxis angle={90} domain={[0, 1]} tickFormatter={(value) => `${value * 100}%`} />
          <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
