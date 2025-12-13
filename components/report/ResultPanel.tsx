"use client";

import { useMemo, useState } from "react";

import { CompatibilityGraph } from "@/components/charts/CompatibilityGraph";
import { MemberRadar } from "@/components/charts/MemberRadar";
import { TeamElementPie } from "@/components/charts/TeamElementPie";
import { RoleCard } from "@/components/report/RoleCard";
import { TeamRoleDistributionView } from "@/components/report/TeamRoleDistribution";
import { CompatibilityDetails } from "@/components/report/CompatibilityDetails";
import { InsightCard } from "@/components/report/InsightCard";
import { LockedSection } from "@/components/report/LockedSection";
import { SupportButton } from "@/components/SupportButton";
import { getElementLabel } from "@/lib/elements";
import type { TeamReportResponse } from "@/types/report";
import { QRCodeSVG } from "qrcode.react";

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
  shareMode = "inline",
  onEdit,
}: {
  result: TeamReportResponse;
  shareMode?: "inline" | "minimal";
  onEdit?: () => void;
}) {
  const donated = result.donated ?? false;
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
            {shareMode === "inline" && <ShareLink teamId={result.teamId} />}
          </div>
        </div>
      </header>
      <section className="space-y-3">
        <ScoreMetric
          label="최종 점수"
          value={result.teamScore.finalScore}
          description="팀 전체의 종합 조화도"
          icon="🎯"
          max={100}
        />
        <div className="grid md:grid-cols-2 gap-3">
          <ScoreMetric
            label="오행 균형"
            value={result.teamScore.balanceIdx}
            description="팀원들의 기운 분포 균형도"
            icon="⚖️"
            max={100}
          />
          <ScoreMetric
            label="상생 흐름"
            value={result.teamScore.nourishIdx}
            description="서로를 북돋우는 에너지"
            icon="🌱"
            max={100}
          />
          <ScoreMetric
            label="조화도"
            value={result.teamScore.conflictIdx}
            description="상극 요소가 적을수록 높음"
            icon="🛡️"
            max={100}
          />
          <ScoreMetric
            label="역할 다양성"
            value={result.teamScore.roleCoverage}
            description="다양한 역할의 보유 정도"
            icon="🎭"
            max={100}
          />
        </div>
      </section>
      <section>
        <h4 className="font-semibold mb-3">팀원 오행 분석</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-slate-600 mb-2">팀 오행 분포</h5>
            <TeamElementPie profiles={aggregatedProfiles} />
          </div>
          <div>
            <h5 className="text-sm font-medium text-slate-600 mb-2">멤버별 레이더</h5>
            <LockedSection
              title="개인별 상세 분석"
              previewText="각 팀원의 오행 밸런스를 레이더 차트로 확인하세요"
              donated={donated}
              teamId={result.teamId}
            >
              <MemberRadar members={result.members} />
            </LockedSection>
          </div>
        </div>
        <div className="mt-4">
          <h5 className="text-sm font-medium text-slate-600 mb-2">팀원 오행 요약</h5>
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
      </section>
      <section>
        <h4 className="font-semibold mb-2">상생/상극 네트워크</h4>
        <CompatibilityGraph
          members={graphMembers}
          pairs={result.pairs.map((pair) => ({
            memberA: pair.memberA,
            memberB: pair.memberB,
            score: pair.score,
          }))}
        />
      </section>
      {/* 팀 역할 분포 */}
      {result.roleDistribution && (
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h4 className="font-semibold mb-2">팀 역할 분포</h4>
            <TeamRoleDistributionView distribution={result.roleDistribution} />
          </div>
          <div className="md:col-span-2">
            <RoleCardSection result={result} donated={donated} />
          </div>
        </section>
      )}
      {/* 형충합 포인트 - 숨김 처리 */}
      {/* <section>
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
      </section> */}
      {/* 궁합 세부 정보 */}
      {result.pairs.length > 0 && (
        <section>
          <h4 className="font-semibold mb-3">팀원 간 궁합 상세 분석</h4>
          <CompatibilityDetails
            pairs={result.pairs}
            members={graphMembers}
            donated={donated}
            teamId={result.teamId}
          />
        </section>
      )}
      {/* 팀 인사이트 */}
      {result.insights && result.insights.length > 0 && (
        <section>
          <InsightCardsSection result={result} donated={donated} />
        </section>
      )}
      {/* 후원 CTA - 항상 표시 */}
      <section className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center space-y-3">
        <div className="text-3xl">💛</div>
        <p className="text-lg font-semibold text-amber-900">
          {donated ? "후원해주셔서 감사합니다!" : "이 분석이 도움이 되셨나요?"}
        </p>
        <p className="text-sm text-amber-700">
          {donated ? (
            <>
              여러분의 후원이 서비스를 더 좋게 만듭니다
              <br />
              <span className="text-xs">추가 후원도 언제나 환영합니다 😊</span>
            </>
          ) : (
            <>
              990원으로 서비스 개선을 응원해주세요!
              <br />
              <span className="text-xs">(선택사항이며, 후원하시면 전체 상세 분석이 잠금 해제됩니다)</span>
            </>
          )}
        </p>
        <div className="flex justify-center">
          <SupportButton variant="default" teamId={result.teamId} />
        </div>
        {!donated && (
          <p className="text-xs text-slate-600 mt-2">
            후원을 하면 모든 블러가 사라집니다
          </p>
        )}
      </section>

      <section className="text-xs text-slate-500">
        그래프 두께/색상은 궁합 점수를 나타냅니다. 세부 상생/상극 네트워크는 추후 고도화됩니다.
      </section>
    </div>
  );
}

function RoleCardSection({
  result,
  donated,
}: {
  result: TeamReportResponse;
  donated: boolean;
}) {
  const [isUnlocked, setIsUnlocked] = useState(donated);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const roleMembers = result.members.filter((member) => member.role);

  const handleSkip = () => {
    setIsUnlocked(true);
    setShowUnlockModal(false);
  };

  const handleDonate = async () => {
    const teamId = result.teamId;
    if (!teamId) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/donate`, {
        method: "POST",
      });

      if (response.ok) {
        setShowUnlockModal(false);
        setIsUnlocked(true);
        // 페이지 새로고침하여 최신 donated 상태 반영
        window.location.reload();
      }
    } catch (error) {
      console.error("Donation error:", error);
    }
  };

  if (roleMembers.length === 0) {
    return (
      <div>
        <h4 className="font-semibold mb-2">팀원별 역할</h4>
        <p className="text-sm text-slate-500">분석된 역할 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-2">팀원별 역할</h4>
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-3">
          {roleMembers.map((member, index) => (
            <RoleCard
              key={member.memberId}
              displayName={member.displayName}
              role={member.role!}
              className={!isUnlocked && index > 0 ? "blur-sm pointer-events-none" : ""}
            />
          ))}
        </div>

        {!isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center p-4">
            <button
              onClick={() => setShowUnlockModal(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span className="text-xl">🔓</span>
              <span>전체 보기</span>
            </button>
          </div>
        )}
      </div>

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-4">💛</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">전체 분석 보기</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>✨ 모든 분석은 무료입니다!</strong>
                  <br />
                  <span className="text-xs text-blue-700">
                    "무료로 바로 볼게요"를 누르시면 바로 확인하실 수 있어요.
                    <br />
                    후원은 선택사항이며, 서비스 개선에 큰 힘이 됩니다.
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 space-y-3">
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow">
                  <QRCodeSVG
                    value="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-slate-800">990원 여기로 보내주세요</p>
                <a
                  href="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block break-all"
                >
                  https://qr.kakaopay.com/Ej7mhmDyi1ef05326
                </a>
                <p className="text-xs text-slate-600">QR코드를 스캔하거나 링크를 눌러 간편하고 안전하게 보내실 수 있습니다</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                <span>990원 후원 완료했어요</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                무료로 바로 볼게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCardsSection({
  result,
  donated,
}: {
  result: TeamReportResponse;
  donated: boolean;
}) {
  const [isUnlocked, setIsUnlocked] = useState(donated);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const insights = result.insights ?? [];

  const handleSkip = () => {
    setIsUnlocked(true);
    setShowUnlockModal(false);
  };

  const handleDonate = async () => {
    const teamId = result.teamId;
    if (!teamId) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/donate`, {
        method: "POST",
      });

      if (response.ok) {
        setShowUnlockModal(false);
        setIsUnlocked(true);
        window.location.reload();
      }
    } catch (error) {
      console.error("Donation error:", error);
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="font-semibold mb-3">팀 인사이트</h4>
      <div className="relative">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight}
              className={!isUnlocked && index > 0 ? "blur-sm pointer-events-none" : ""}
            />
          ))}
        </div>

        {!isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center p-4">
            <button
              onClick={() => setShowUnlockModal(true)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span className="text-xl">🔓</span>
              <span>전체 보기</span>
            </button>
          </div>
        )}
      </div>

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-4">💛</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">전체 분석 보기</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>✨ 모든 분석은 무료입니다!</strong>
                  <br />
                  <span className="text-xs text-blue-700">
                    "무료로 바로 볼게요"를 누르시면 바로 확인하실 수 있어요.
                    <br />
                    후원은 선택사항이며, 서비스 개선에 큰 힘이 됩니다.
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 space-y-3">
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow">
                  <QRCodeSVG
                    value="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-slate-800">990원 여기로 보내주세요</p>
                <a
                  href="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block break-all"
                >
                  https://qr.kakaopay.com/Ej7mhmDyi1ef05326
                </a>
                <p className="text-xs text-slate-600">QR코드를 스캔하거나 링크를 눌러 간편하고 안전하게 보내실 수 있습니다</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                <span>990원 후원 완료했어요</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                무료로 바로 볼게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreMetric({
  label,
  value,
  description,
  icon,
  max,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  max: number;
}) {
  const percentage = (value / max) * 100;

  const getColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-500", text: "text-green-700", light: "bg-green-50" };
    if (score >= 50) return { bg: "bg-blue-500", text: "text-blue-700", light: "bg-blue-50" };
    if (score >= 30) return { bg: "bg-yellow-500", text: "text-yellow-700", light: "bg-yellow-50" };
    return { bg: "bg-orange-500", text: "text-orange-700", light: "bg-orange-50" };
  };

  const colors = getColor(value);

  return (
    <div className={`border border-slate-200 rounded-lg p-4 ${colors.light}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-slate-800">{label}</h4>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${colors.text}`}>{value.toFixed(1)}</span>
          <span className="text-xs text-slate-400">/{max}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bg} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ShareLink({ teamId }: { teamId: string }) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/team/${teamId}`
      : `/team/${teamId}`;
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <span className="text-lg">🔗</span>
        {copied ? "✓ 링크 복사됨!" : "공유하기"}
      </button>
    </div>
  );
}