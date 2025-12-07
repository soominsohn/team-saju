"use client";

import { useState } from "react";

import { ResultPanel } from "@/components/report/ResultPanel";
import { TeamForm, type MemberInput } from "@/components/TeamForm";
import type { TeamReportResponse } from "@/types/report";

type ApiResponse = TeamReportResponse;

export default function HomePage() {
  const [showNewReportButton, setShowNewReportButton] = useState(false);

  return (
    <section className="space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">우리팀 사주 오행 궁합</h1>
            <p className="text-slate-600 mt-2">
              생년월일/출생시를 입력하면 팀 오행 균형과 상생/상극 지표를 바로 계산합니다.
            </p>
          </div>
          {showNewReportButton && (
            <button
              type="button"
              onClick={() => setShowNewReportButton(false)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 whitespace-nowrap"
            >
              + 새 리포트 만들기
            </button>
          )}
        </div>
      </header>
      <TeamPlanner
        onReportGenerated={() => setShowNewReportButton(true)}
        onNewReport={() => setShowNewReportButton(false)}
      />
    </section>
  );
}

function TeamPlanner({
  onReportGenerated,
  onNewReport,
}: {
  onReportGenerated: () => void;
  onNewReport: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const handleSubmit = async (data: { teamName: string; purpose: string; members: MemberInput[] }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShareToken(null);

    try {
      const response = await fetch("/api/reports/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: data.teamName,
          purpose: data.purpose,
          members: data.members.map((member) => {
            // 년/월/일을 YYYY-MM-DD 형식으로 변환
            const year = member.birthYear.padStart(4, "0");
            const month = member.birthMonth.padStart(2, "0");
            const day = member.birthDay.padStart(2, "0");
            const birthDate = `${year}-${month}-${day}`;

            return {
              displayName: member.displayName,
              birthDate,
              birthTime: member.birthTimeUnknown ? undefined : (member.birthTime || undefined),
              isLunar: member.isLunar,
            };
          }),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "분석에 실패했습니다");
      }

      const responseData: ApiResponse = await response.json();
      setResult({ ...responseData, pairs: responseData.pairs ?? [] });
      setShareToken(responseData.shareToken || null);
      onReportGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    setResult(null);
    setShareToken(null);
    setError(null);
    onNewReport();
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        <TeamForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitButtonText="팀 리포트 생성"
        />

        <aside className="space-y-4">
          {result ? (
            <ResultPanel result={result} shareToken={shareToken} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg">
              분석 결과가 여기에 표시됩니다.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
