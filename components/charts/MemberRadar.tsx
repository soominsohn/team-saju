"use client";

import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { getElementLabel, calculateRawElementCounts, type GanJiChart, EarthlyBranch, HeavenlyStem } from "@/lib/elements";

const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;

type Member = {
  memberId?: string;
  displayName: string;
  profile: Record<string, number>;
  chart?: {
    yearStem: string;
    yearBranch: string;
    monthStem: string;
    monthBranch: string;
    dayStem: string;
    dayBranch: string;
    hourStem?: string;
    hourBranch?: string;
  };
};

type Props = {
  members: Member[];
};

export function MemberRadar({ members }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const data = useMemo(() => {
    if (!members.length) return [];
    const member = members[selectedIndex] ?? members[0];

    // If chart data is available, use raw counts
    if (member.chart) {
      const chart: GanJiChart = {
        yearStem: member.chart.yearStem as HeavenlyStem,
        yearBranch: member.chart.yearBranch as EarthlyBranch,
        monthStem: member.chart.monthStem as HeavenlyStem,
        monthBranch: member.chart.monthBranch as EarthlyBranch,
        dayStem: member.chart.dayStem as HeavenlyStem,
        dayBranch: member.chart.dayBranch as EarthlyBranch,
        hourStem: member.chart.hourStem as HeavenlyStem | undefined,
        hourBranch: member.chart.hourBranch as EarthlyBranch | undefined,
      };
      const rawCounts = calculateRawElementCounts(chart);
      return ELEMENT_KEYS.map((key) => ({ element: getElementLabel(key), value: rawCounts[key] ?? 0 }));
    }

    // Fallback to normalized profile
    return ELEMENT_KEYS.map((key) => ({ element: getElementLabel(key), value: member.profile[key] ?? 0 }));
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
          <PolarRadiusAxis angle={90} domain={[0, 8]} />
          <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
