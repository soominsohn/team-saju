"use client";

import { useState } from "react";
import type { PairReport } from "@/types/report";
import { LockedSection } from "./LockedSection";

type Props = {
  pairs: PairReport[];
  members: Array<{ id: string; name: string }>;
  donated: boolean;
  teamId: string;
};

export function CompatibilityDetails({ pairs, members, donated, teamId }: Props) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name ?? memberId;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 50) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-orange-700 bg-orange-50 border-orange-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "좋은 궁합";
    if (score >= 50) return "보통 궁합";
    return "주의 필요";
  };

  // 필터링된 페어 목록
  const filteredPairs = selectedMemberId
    ? pairs.filter(
        (pair) => pair.memberA === selectedMemberId || pair.memberB === selectedMemberId
      )
    : pairs;

  const renderPairCards = (pairsToRender: PairReport[]) => {
    if (pairsToRender.length === 0) {
      return null;
    }
    return (
      <div className="space-y-3">
        {pairsToRender.map((pair, index) => {
          const memberAName = getMemberName(pair.memberA);
          const memberBName = getMemberName(pair.memberB);
          const scoreColor = getScoreColor(pair.score);

          // 선택된 멤버가 앞에 오도록 순서 조정
          const isASelected = selectedMemberId === pair.memberA;
          const isBSelected = selectedMemberId === pair.memberB;
          const firstName = isBSelected ? memberBName : memberAName;
          const secondName = isBSelected ? memberAName : memberBName;

          return (
            <div key={`${pair.memberA}-${pair.memberB}-${index}`} className="border border-slate-200 rounded-lg p-4 space-y-3">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-lg">
                  {firstName} ↔ {secondName}
                </h5>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${scoreColor}`}>
                    {getScoreLabel(pair.score)}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-indigo-600">{pair.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {pair.breakdown && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <BreakdownItem
                    label="오행 조화"
                    value={pair.breakdown.elementHarmony}
                    max={20}
                  />
                  <BreakdownItem
                    label="간지 조화"
                    value={pair.breakdown.ganjiHarmony}
                    max={25}
                  />
                  <BreakdownItem
                    label="역할 시너지"
                    value={pair.breakdown.roleCompatibility}
                    max={15}
                  />
                  <BreakdownItem
                    label="기운 균형"
                    value={pair.breakdown.elementBalance}
                    max={10}
                  />
                </div>
              )}

              {/* Strengths */}
              {pair.strengths.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-green-700 mb-1">💚 강점</div>
                  <div className="flex flex-wrap gap-1">
                    {pair.strengths.map((strength, i) => (
                      <span
                        key={i}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {pair.risks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-orange-700 mb-1">⚠️ 주의사항</div>
                  <div className="flex flex-wrap gap-1">
                    {pair.risks.map((risk, i) => (
                      <span
                        key={i}
                        className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200"
                      >
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {pair.recommendations && pair.recommendations.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-indigo-700 mb-1">💡 추천사항</div>
                  <ul className="space-y-1">
                    {pair.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-600 pl-3">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const NoInfoMessage = () => (
    <p className="text-sm text-slate-500 text-center py-8">
      선택한 멤버의 궁합 정보가 없습니다.
    </p>
  );

  return (
    <div className="space-y-4">
      {/* 멤버 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedMemberId(null)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            selectedMemberId === null
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
          }`}
        >
          전체
        </button>
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              selectedMemberId === member.id
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
            }`}
          >
            {member.name}
          </button>
        ))}
      </div>

      {/* 궁합 카드 목록 */}
      {filteredPairs.length === 0 ? (
        <NoInfoMessage />
      ) : (
        <LockedSection
          title="팀원 간 궁합 상세 분석"
          previewText="누가 누구와 잘 맞는지, 어떤 점을 주의해야 하는지 구체적인 분석을 확인하세요"
          donated={donated}
          teamId={teamId}
          preview={renderPairCards(filteredPairs.slice(0, 1))}
        >
          {renderPairCards(filteredPairs.slice(1))}
        </LockedSection>
      )}
    </div>
  );
}

function BreakdownItem({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.abs((value / max) * 100);
  const isPositive = value >= 0;
  const color = isPositive ? "bg-green-500" : "bg-orange-500";

  return (
    <div className="border border-slate-200 rounded p-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-slate-600">{label}</span>
        <span className={`font-semibold ${isPositive ? "text-green-700" : "text-orange-700"}`}>
          {value > 0 ? "+" : ""}{value.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-[10px] text-slate-400 text-right">
        ±{max}
      </div>
    </div>
  );
}