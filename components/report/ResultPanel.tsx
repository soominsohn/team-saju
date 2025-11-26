"use client";

import { useMemo, useState } from "react";

import { CompatibilityGraph } from "@/components/charts/CompatibilityGraph";
import { MemberRadar } from "@/components/charts/MemberRadar";
import { TeamElementPie } from "@/components/charts/TeamElementPie";
import { RoleCard } from "@/components/report/RoleCard";
import { TeamRoleDistributionView } from "@/components/report/TeamRoleDistribution";
import { CompatibilityDetails } from "@/components/report/CompatibilityDetails";
import { InsightCards } from "@/components/report/InsightCards";
import { getElementLabel } from "@/lib/elements";
import type { TeamReportResponse } from "@/types/report";

const TEN_GOD_LABELS: Record<string, string> = {
  friend: "비견",
  robWealth: "겁재",
  foodGod: "식신",
  hurtingOfficer: "상관",
  directWealth: "정재",
  indirectWealth: "편재",
  directOfficer: "정관",
  indirectOfficer: "편관",
  directResource: "정인",
  indirectResource: "편인",
};

const relationTypeLabel: Record<string, string> = {
  clash: "상충",
  harm: "상해",
  combine: "합",
  punish: "형",
};

export function ResultPanel({
  result,
  shareToken,
  shareMode = "inline",
  onEdit,
}: {
  result: TeamReportResponse;
  shareToken: string | null;
  shareMode?: "inline" | "minimal";
  onEdit?: () => void;
}) {
  const aggregatedProfiles = useMemo(() => result.members.map((member) => member.profile), [result]);
  const graphMembers = useMemo(
    () => result.members.map((member) => ({ id: member.memberId, name: member.displayName })),
    [result.members],
  );
  const branchRelations = result.dynamics?.branchRelations ?? [];

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-4">
      <header className="space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-xl font-semibold">{result.teamName}</h3>
            {result.purpose && <p className="text-slate-500">목적: {result.purpose}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1 bg-slate-700 text-white text-sm rounded hover:bg-slate-800"
              >
                팀원 추가/수정
              </button>
            )}
            {shareToken && shareMode === "inline" && (
              <ShareLink teamId={result.teamId} token={shareToken} />
            )}
          </div>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="최종 점수" value={result.teamScore.finalScore.toFixed(1)} />
        <Metric label="균형" value={result.teamScore.balanceIdx.toFixed(1)} />
        <Metric label="상생" value={result.teamScore.nourishIdx.toFixed(1)} />
        <Metric label="상극" value={result.teamScore.conflictIdx.toFixed(1)} />
        <Metric label="역할 커버리지" value={result.teamScore.roleCoverage.toFixed(1)} />
      </section>
      <section className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">팀 오행 분포</h4>
          <TeamElementPie profiles={aggregatedProfiles} />
        </div>
        <div>
          <h4 className="font-semibold mb-2">멤버 레이더</h4>
          <MemberRadar members={result.members} />
        </div>
      </section>
      <section className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">팀원 오행 요약</h4>
          <ul className="space-y-2 text-sm text-slate-700 max-h-72 overflow-auto pr-2">
            {result.members.map((member) => (
              <li key={member.memberId} className="border border-slate-200 rounded p-2">
                <p className="font-semibold">
                  {member.displayName} — 주체오행 {member.dominant ? getElementLabel(member.dominant) : "-"}
                </p>
                <p>결핍: {member.insights.missing.map(getElementLabel).join(", ") || "없음"}</p>
                <p>편중: {member.insights.skewed.map(getElementLabel).join(", ") || "없음"}</p>
                <p className="text-xs text-slate-500">
                  십신: {member.tenGodHighlights.length
                    ? member.tenGodHighlights.map((key) => TEN_GOD_LABELS[key] ?? key).join(", ")
                    : "균형"}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">상생/상극 네트워크</h4>
          <CompatibilityGraph
            members={graphMembers}
            pairs={result.pairs.map((pair) => ({
              memberA: pair.memberA,
              memberB: pair.memberB,
              score: pair.score,
            }))}
          />
        </div>
      </section>
      {/* 팀 역할 분포 */}
      {result.roleDistribution && (
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-2">팀 역할 분포</h4>
            <TeamRoleDistributionView distribution={result.roleDistribution} />
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-2">팀원별 역할</h4>
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-auto pr-2">
              {result.members
                .filter((member) => member.role)
                .map((member) => (
                  <RoleCard key={member.memberId} displayName={member.displayName} role={member.role!} />
                ))}
            </div>
          </div>
        </section>
      )}
      <section>
        <h4 className="font-semibold mb-2">형충합 포인트</h4>
        {branchRelations.length ? (
          <ul className="space-y-2 text-sm text-slate-700">
            {branchRelations.map((relation, index) => (
              <li key={`${relation.members.join("-")}-${index}`} className="border border-slate-200 rounded p-2">
                <p className="font-semibold">{relationTypeLabel[relation.type] ?? relation.type}</p>
                <p className="text-xs text-slate-500">{relation.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">형충합 패턴이 두드러지지 않습니다.</p>
        )}
      </section>
      {/* 궁합 세부 정보 */}
      {result.pairs.length > 0 && (
        <section>
          <h4 className="font-semibold mb-3">팀원 간 궁합 상세 분석</h4>
          <CompatibilityDetails pairs={result.pairs} members={graphMembers} />
        </section>
      )}
      {/* 팀 인사이트 */}
      {result.insights && result.insights.length > 0 && (
        <section>
          <h4 className="font-semibold mb-3">팀 인사이트</h4>
          <InsightCards insights={result.insights} />
        </section>
      )}
      <section className="text-xs text-slate-500">
        그래프 두께/색상은 궁합 점수를 나타냅니다. 세부 상생/상극 네트워크는 추후 고도화됩니다.
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded p-2">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function ShareLink({ teamId, token }: { teamId: string; token: string }) {
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/team/${teamId}?token=${token}`
    : `/team/${teamId}?token=${token}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="truncate max-w-[220px]">{shareUrl}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="px-2 py-1 bg-indigo-600 text-white rounded"
      >
        {copied ? "복사됨" : "링크 복사"}
      </button>
    </div>
  );
}
