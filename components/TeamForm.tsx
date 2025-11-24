"use client";

import { useState } from "react";

export type MemberInput = {
  displayName: string;
  birthDate: string;
  birthTime?: string;
};

const emptyMember: MemberInput = {
  displayName: "",
  birthDate: "",
  birthTime: "",
};

type TeamFormProps = {
  initialTeamName?: string;
  initialPurpose?: string;
  initialMembers?: MemberInput[];
  onSubmit: (data: { teamName: string; purpose: string; members: MemberInput[] }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitButtonText?: string;
  onCancel?: () => void;
};

export function TeamForm({
  initialTeamName = "",
  initialPurpose = "",
  initialMembers = [{ ...emptyMember }],
  onSubmit,
  loading = false,
  error = null,
  submitButtonText = "팀 리포트 생성",
  onCancel,
}: TeamFormProps) {
  const [teamName, setTeamName] = useState(initialTeamName);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [members, setMembers] = useState<MemberInput[]>(initialMembers);

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
    await onSubmit({ teamName, purpose, members });
  };

  return (
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
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white font-semibold rounded-md py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "분석 중..." : submitButtonText}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-slate-200 text-slate-700 font-semibold rounded-md py-2"
          >
            취소
          </button>
        )}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
