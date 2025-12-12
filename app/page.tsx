"use client";

import { useState } from "react";

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
      setResult({ ...responseData, pairs: responseData.pairs ?? [] });
      setShareToken(responseData.shareToken || null);

      // 편집 모드를 위한 초기 데이터 설정
      setInitialFormData({
        teamName: data.teamName,
        purpose: data.purpose,
        members: data.members,
      });

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
    setEditMode(false);
    setInitialFormData(null);
    onNewReport();
  };

  const handleUpdate = async (data: { teamName: string; purpose: string; members: MemberInput[] }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: data.teamName,
          purpose: data.purpose,
          members: data.members.map((member) => {
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
        throw new Error(payload.message ?? "업데이트에 실패했습니다");
      }

      const responseData: ApiResponse = await response.json();
      setResult({ ...responseData, pairs: responseData.pairs ?? [] });
      setShareToken(responseData.shareToken || null);

      // 편집 모드를 위한 초기 데이터 업데이트
      setInitialFormData({
        teamName: data.teamName,
        purpose: data.purpose,
        members: data.members,
      });

      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 편집 모드일 때
  if (editMode && initialFormData && result) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">팀 정보 수정</p>
              <h1 className="text-3xl font-semibold">{result.teamName}</h1>
            </div>
            <button
              type="button"
              onClick={handleNewReport}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 whitespace-nowrap"
            >
              + 새 리포트 만들기
            </button>
          </div>
        </header>
        <div className="grid lg:grid-cols-2 gap-8">
          <TeamForm
            initialTeamName={initialFormData.teamName}
            initialPurpose={initialFormData.purpose}
            initialMembers={initialFormData.members}
            onSubmit={handleUpdate}
            loading={loading}
            error={error}
            submitButtonText="리포트 재생성"
            onCancel={() => setEditMode(false)}
          />
          <aside className="space-y-4">
            <ResultPanel result={result} shareToken={shareToken} />
          </aside>
        </div>
      </div>
    );
  }

  // 결과가 있으면 전체 화면으로 표시 (공유 페이지처럼)
  if (result) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">분석 완료</p>
              <h1 className="text-3xl font-semibold">{result.teamName}</h1>
              {result.purpose && <p className="text-slate-600">목적: {result.purpose}</p>}
            </div>
            <button
              type="button"
              onClick={handleNewReport}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 whitespace-nowrap"
            >
              + 새 리포트 만들기
            </button>
          </div>
        </header>
        <ResultPanel result={result} shareToken={shareToken} onEdit={() => setEditMode(true)} />
      </div>
    );
  }

  // 결과가 없으면 폼만 표시
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
