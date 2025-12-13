"use client";

import type { RoleProfile } from "@/lib/roles";
import { getRoleLabel } from "@/lib/roles";

type Props = {
  displayName: string;
  role: RoleProfile;
  className?: string;
};

export function RoleCard({ displayName, role, className }: Props) {
  return (
    <div className={`border border-slate-200 rounded-lg p-4 space-y-3 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-lg">{displayName}</h4>
          <p className="text-sm text-slate-600">
            {getRoleLabel(role.primary)}
            {role.secondary && ` • ${getRoleLabel(role.secondary)}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">역할 발현도</div>
          <div className="flex items-baseline gap-1">
            <div className="text-xl font-bold text-indigo-600">{role.intensity}</div>
            <div className="text-xs text-slate-400">/100</div>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {role.intensity >= 35 ? "강함" : role.intensity >= 20 ? "보통" : "약함"}
          </div>
        </div>
      </div>

      {/* 강점 */}
      <div>
        <div className="text-xs font-semibold text-green-700 mb-1">💪 강점</div>
        <div className="flex flex-wrap gap-1">
          {role.strengths.map((strength, index) => (
            <span
              key={index}
              className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* 약점 */}
      <div>
        <div className="text-xs font-semibold text-orange-700 mb-1">⚠️ 주의사항</div>
        <div className="flex flex-wrap gap-1">
          {role.weaknesses.map((weakness, index) => (
            <span
              key={index}
              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200"
            >
              {weakness}
            </span>
          ))}
        </div>
      </div>

      {/* 추천 */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-700 mb-1">💡 추천</div>
        <p className="text-xs text-slate-600">{role.recommendation}</p>
      </div>

      {/* 설명 */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 italic">
          * 역할 발현도는 해당 역할의 특성이 사주에서 얼마나 강하게 나타나는지를 의미합니다.
          높을수록 해당 역할의 강점과 약점이 더 뚜렷하게 드러납니다.
        </p>
      </div>
    </div>
  );
}