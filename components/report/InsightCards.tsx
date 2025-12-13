"use client";

import type { TeamInsight } from "@/lib/insights";
import { InsightCard } from "./InsightCard";

type Props = {
  insights: TeamInsight[];
};

export function InsightCards({ insights }: Props) {
  if (!insights || insights.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        팀 인사이트를 생성할 수 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} />
      ))}
    </div>
  );
}