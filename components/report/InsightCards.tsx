"use client";

import type { TeamInsight, InsightCategory, InsightPriority } from "@/lib/insights";

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

function InsightCard({ insight }: { insight: TeamInsight }) {
  const categoryConfig = getCategoryConfig(insight.category);
  const priorityConfig = getPriorityConfig(insight.priority);

  return (
    <div
      className={`border rounded-lg p-4 space-y-2 ${priorityConfig.borderColor} ${priorityConfig.bgColor}`}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryConfig.icon}</span>
          <h5 className={`font-semibold ${priorityConfig.textColor}`}>
            {insight.title}
          </h5>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${priorityConfig.badgeClass}`}>
          {priorityConfig.label}
        </span>
      </div>

      {/* 설명 */}
      <p className="text-sm text-slate-700">{insight.description}</p>

      {/* 관련 멤버 */}
      {insight.affectedMembers && insight.affectedMembers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold">관련 멤버:</span>
          <div className="flex flex-wrap gap-1">
            {insight.affectedMembers.map((member, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
              >
                {member}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 추천사항 */}
      {insight.recommendation && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-semibold text-xs">💡 추천:</span>
            <p className="text-xs text-slate-600 flex-1">{insight.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryConfig(category: InsightCategory): {
  icon: string;
  label: string;
} {
  const configs: Record<InsightCategory, { icon: string; label: string }> = {
    balance: { icon: "⚖️", label: "균형" },
    energy: { icon: "⚡", label: "에너지" },
    risk: { icon: "⚠️", label: "위험" },
    opportunity: { icon: "✨", label: "기회" },
  };

  return configs[category];
}

function getPriorityConfig(priority: InsightPriority): {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
} {
  const configs: Record<
    InsightPriority,
    {
      label: string;
      textColor: string;
      bgColor: string;
      borderColor: string;
      badgeClass: string;
    }
  > = {
    high: {
      label: "높음",
      textColor: "text-red-800",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeClass: "bg-red-100 text-red-700 border-red-300",
    },
    medium: {
      label: "보통",
      textColor: "text-yellow-800",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    low: {
      label: "낮음",
      textColor: "text-blue-800",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      badgeClass: "bg-blue-100 text-blue-700 border-blue-300",
    },
  };

  return configs[priority];
}
