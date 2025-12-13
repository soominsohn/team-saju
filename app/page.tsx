"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ResultPanel } from "@/components/report/ResultPanel";
import { TeamForm, type MemberInput } from "@/components/TeamForm";
import type { TeamReportResponse } from "@/types/report";

type ApiResponse = TeamReportResponse;

export default function HomePage() {
  const [hasResult, setHasResult] = useState(false);

  return (
    <section className="space-y-6">
      {!hasResult && (
        <header className="max-w-2xl mx-auto">
          <div>
            <h1 className="text-3xl font-semibold">우리팀 사주 오행 궁합</h1>
            <p className="text-slate-600 mt-2">
              생년월일/출생시를 입력하면 팀 오행 균형과 상생/상극 지표를 바로 계산합니다.
            </p>
          </div>
        </header>
      )}
      <TeamPlanner
        onReportGenerated={() => setHasResult(true)}
        onNewReport={() => setHasResult(false)}
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [initialFormData, setInitialFormData] = useState<{
    teamName: string;
    purpose: string;
    members: MemberInput[];
  } | null>(null);

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

      // 공유 URL로 리다이렉트
      if (responseData.teamId) {
        router.push(`/team/${responseData.teamId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 홈페이지는 항상 폼만 표시
  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <TeamForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitButtonText="팀 리포트 생성"
        />
      </div>
    </div>
  );
}
