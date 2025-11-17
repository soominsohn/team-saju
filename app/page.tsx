"use client";

import { useState } from "react";

import { ResultPanel } from "@/components/report/ResultPanel";
import type { TeamReportResponse } from "@/types/report";

type MemberInput = {
  displayName: string;
  birthDate: string;
  birthTime?: string;
};

type ApiResponse = TeamReportResponse;

const emptyMember: MemberInput = {
  displayName: "",
  birthDate: "",
  birthTime: "",
};

export default function HomePage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">우리팀 사주 오행 궁합</h1>
        <p className="text-slate-600 mt-2">
          생년월일/출생시를 입력하면 팀 오행 균형과 상생/상극 지표를 바로 계산합니다.
        </p>
      </header>
      <TeamPlanner />
    </section>
  );
}

function TeamPlanner() {
  const [teamName, setTeamName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([{ ...emptyMember }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loadingShare, setLoadingShare] = useState(false);

  const updateMember = (index: number, field: keyof MemberInput, value: string) => {
    setMembers((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });
  };

  const addMember = () => setMembers((prev) => [...prev, { ...emptyMember }]);
  const removeMember = (index: number) =>
    setMembers((prev) => prev.filter((_, idx) => idx !== index));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShareToken(null);

    try {
      const response = await fetch("/api/reports/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          purpose,
          members: members.map((member) => ({
            displayName: member.displayName,
            birthDate: member.birthDate,
            birthTime: member.birthTime || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "분석에 실패했습니다");
      }

      const data: ApiResponse = await response.json();
      setResult({ ...data, pairs: data.pairs ?? [] });
      setShareToken(tokenInput || data.shareToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ShareLookupForm
        setResult={setResult}
        setError={setError}
        setShareToken={setShareToken}
        loadingShare={loadingShare}
        setLoadingShare={setLoadingShare}
      />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded-lg">
        <section className="space-y-2">
          <label className="block text-sm font-semibold">팀 이름</label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="예: Product Innovation"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </section>
        <section className="space-y-2">
          <label className="block text-sm font-semibold">팀 목적</label>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="예: 신규 서비스 기획"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </section>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">팀원 정보</h2>
            <button
              type="button"
              onClick={addMember}
              className="text-sm text-indigo-600 hover:underline"
            >
              + 팀원 추가
            </button>
          </div>
          {members.map((member, index) => (
            <div key={index} className="space-y-2 border border-slate-200 rounded-md p-3">
              <div className="flex gap-3">
                <input
                  className="flex-1 rounded border border-slate-300 px-3 py-2"
                  placeholder="닉네임"
                  value={member.displayName}
                  onChange={(e) => updateMember(index, "displayName", e.target.value)}
                  required
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-sm text-rose-600"
                  >
                    제거
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={member.birthDate}
                  onChange={(e) => updateMember(index, "birthDate", e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="rounded border border-slate-300 px-3 py-2"
                  value={member.birthTime}
                  onChange={(e) => updateMember(index, "birthTime", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold rounded-md py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "분석 중..." : "팀 리포트 생성"}
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>

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


function ShareLookupForm({
  setResult,
  setError,
  setShareToken,
  loadingShare,
  setLoadingShare,
}: {
  setResult: (result: ApiResponse | null) => void;
  setError: (error: string | null) => void;
  setShareToken: (token: string | null) => void;
  loadingShare: boolean;
  setLoadingShare: (loading: boolean) => void;
}) {
  const [teamIdInput, setTeamIdInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!teamIdInput) return;
    setLoadingShare(true);
    setError(null);

    try {
      const query = tokenInput ? `?token=${tokenInput}` : "";
      const response = await fetch(`/api/teams/${teamIdInput}${query}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "리포트를 불러오지 못했습니다");
      }
      const data: ApiResponse = await response.json();
      setResult({ ...data, pairs: data.pairs ?? [] });
      setShareToken(data.shareToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      setResult(null);
      setShareToken(null);
    } finally {
      setLoadingShare(false);
    }
  };

  return (
    <form onSubmit={handleLookup} className="p-4 bg-white shadow rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">저장된 팀 리포트 불러오기</h2>
        <span className="text-xs text-slate-500">팀 ID와 공유 토큰으로 접근</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="팀 ID"
          value={teamIdInput}
          onChange={(e) => setTeamIdInput(e.target.value)}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="공유 토큰(선택)"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-slate-900 text-white rounded px-3 py-2 disabled:opacity-60"
          disabled={loadingShare}
        >
          {loadingShare ? "불러오는 중..." : "불러오기"}
        </button>
      </div>
    </form>
  );
}

function ShareLink({ teamId, token }: { teamId: string; token: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/api/teams/${teamId}?token=${token}` : "";

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
      <span className="truncate max-w-[220px]">{shareUrl || `${teamId}?token=${token}`}</span>
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
