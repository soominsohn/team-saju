"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { ResultPanel } from "@/components/report/ResultPanel";
import { TeamForm, type MemberInput } from "@/components/TeamForm";
import type { TeamReportResponse } from "@/types/report";

export default function TeamReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.teamId as string;
  const token = searchParams.get("token") ?? "";

  const [report, setReport] = useState<TeamReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Edit form pre-filled data
  const [initialFormData, setInitialFormData] = useState<{
    teamName: string;
    purpose: string;
    members: MemberInput[];
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const query = token ? `?token=${token}` : "";
        const response = await fetch(`/api/teams/${teamId}${query}`);

        if (!response.ok) {
          throw new Error("리포트를 불러오는 중 오류가 발생했습니다");
        }

        const data: TeamReportResponse = await response.json();
        setReport(data);

        // Pre-populate edit form with current data
        setInitialFormData({
          teamName: data.teamName,
          purpose: data.purpose || "",
          members: data.members.map((member) => ({
            displayName: member.displayName,
            birthDate: member.birthDate,
            birthTime: member.birthTime || "",
          })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [teamId, token]);

  const handleUpdate = async (data: { teamName: string; purpose: string; members: MemberInput[] }) => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: data.teamName,
          purpose: data.purpose,
          members: data.members.map((member) => ({
            displayName: member.displayName,
            birthDate: member.birthDate,
            birthTime: member.birthTime || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "업데이트에 실패했습니다");
      }

      const responseData: TeamReportResponse = await response.json();
      setReport(responseData);

      // Update initial form data with new report data
      setInitialFormData({
        teamName: responseData.teamName,
        purpose: responseData.purpose || "",
        members: responseData.members.map((member) => ({
          displayName: member.displayName,
          birthDate: member.birthDate,
          birthTime: member.birthTime || "",
        })),
      });

      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-center text-slate-500">리포트를 불러오는 중...</p>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-center text-rose-600">{error || "리포트를 찾을 수 없습니다"}</p>
      </section>
    );
  }

  if (editMode && initialFormData) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">팀 리포트 수정</p>
              <h1 className="text-3xl font-semibold">팀 정보 수정</h1>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 whitespace-nowrap"
            >
              + 새 리포트 만들기
            </a>
          </div>
        </header>
        <div className="grid lg:grid-cols-2 gap-8">
          <TeamForm
            initialTeamName={initialFormData.teamName}
            initialPurpose={initialFormData.purpose}
            initialMembers={initialFormData.members}
            onSubmit={handleUpdate}
            loading={updating}
            error={error}
            submitButtonText="리포트 재생성"
            onCancel={() => setEditMode(false)}
          />

          <aside className="space-y-4">
            {report ? (
              <ResultPanel
                result={report}
                shareToken={token || report.shareToken || null}
                shareMode="inline"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg">
                리포트를 불러오는 중...
              </div>
            )}
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">팀 리포트 뷰어</p>
            <h1 className="text-3xl font-semibold">{report.teamName}</h1>
            {report.purpose && <p className="text-slate-600">목적: {report.purpose}</p>}
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 whitespace-nowrap"
          >
            + 새 리포트 만들기
          </a>
        </div>
      </header>
      <ResultPanel
        result={report}
        shareToken={token || report.shareToken || null}
        shareMode="inline"
        onEdit={() => setEditMode(true)}
      />
    </section>
  );
}
