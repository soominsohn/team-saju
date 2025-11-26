"use client";

import type { TeamRoleDistribution } from "@/lib/roles";
import { getRoleLabel, TeamRole } from "@/lib/roles";

type Props = {
  distribution: TeamRoleDistribution;
};

const ROLE_COLORS: Record<TeamRole, string> = {
  [TeamRole.LEADER]: "bg-red-100 text-red-700 border-red-300",
  [TeamRole.STRATEGIST]: "bg-green-100 text-green-700 border-green-300",
  [TeamRole.COORDINATOR]: "bg-yellow-100 text-yellow-700 border-yellow-300",
  [TeamRole.ANALYST]: "bg-blue-100 text-blue-700 border-blue-300",
  [TeamRole.COMMUNICATOR]: "bg-cyan-100 text-cyan-700 border-cyan-300",
};

export function TeamRoleDistributionView({ distribution }: Props) {
  const totalMembers = Object.values(distribution.distribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      {/* 다양성 점수 */}
      <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div>
          <div className="text-xs text-indigo-600 font-semibold">역할 다양성</div>
          <div className="text-sm text-indigo-800">5가지 역할 중 {5 - distribution.missing.length}개 보유</div>
        </div>
        <div className="text-2xl font-bold text-indigo-600">{distribution.diversity}</div>
      </div>

      {/* 역할 분포 차트 */}
      <div>
        <div className="text-sm font-semibold mb-2">팀 역할 구성</div>
        <div className="space-y-2">
          {(Object.keys(distribution.distribution) as TeamRole[]).map((role) => {
            const count = distribution.distribution[role];
            const percentage = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

            return (
              <div key={role} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{getRoleLabel(role)}</span>
                  <span className="text-slate-500">
                    {count}명 ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${ROLE_COLORS[role]} border-r-2 transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 부족한 역할 */}
      {distribution.missing.length > 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-xs font-semibold text-orange-700 mb-1">⚠️ 부족한 역할</div>
          <div className="flex flex-wrap gap-1">
            {distribution.missing.map((role) => (
              <span
                key={role}
                className="text-xs bg-white text-orange-700 px-2 py-1 rounded-full border border-orange-300"
              >
                {getRoleLabel(role)}
              </span>
            ))}
          </div>
          <p className="text-xs text-orange-600 mt-2">
            이 역할들이 부족합니다. 새로운 팀원을 영입하거나 기존 팀원이 역할을 보완할 수 있습니다.
          </p>
        </div>
      )}

      {/* 지배적 역할 */}
      {distribution.dominant && distribution.distribution[distribution.dominant] > totalMembers / 2 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs font-semibold text-blue-700 mb-1">📊 지배적 역할</div>
          <p className="text-xs text-blue-600">
            팀의 절반 이상이 <strong>{getRoleLabel(distribution.dominant)}</strong>입니다. 다른 역할의 관점도 적극 활용하면
            좋습니다.
          </p>
        </div>
      )}
    </div>
  );
}
