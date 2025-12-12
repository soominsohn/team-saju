"use client";

import { useState, useRef } from "react";

export type MemberInput = {
  displayName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime?: string;
  birthTimeUnknown?: boolean;
  isLunar?: boolean;
  birthAmPm?: "AM" | "PM";
  birthHour?: string;
  birthMinute?: string;
};

const emptyMember: MemberInput = {
  displayName: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  birthTime: "",
  birthTimeUnknown: false,
  isLunar: false,
  birthAmPm: "AM",
  birthHour: "",
  birthMinute: "",
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

  // 각 멤버의 입력 필드에 대한 ref 저장
  const monthInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dayInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const minuteInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 해당 년/월의 최대 일수를 계산하는 헬퍼 함수
  const getDaysInMonth = (year: string, month: string): number => {
    const y = parseInt(year) || 2000;
    const m = parseInt(month);
    if (!m || m < 1 || m > 12) return 31;
    return new Date(y, m, 0).getDate();
  };

  // 오전/오후와 시간을 24시간 형식으로 변환
  const convertTo24Hour = (amPm: "AM" | "PM", hour: string): string => {
    const h = parseInt(hour) || 0;
    if (amPm === "PM" && h !== 12) {
      return (h + 12).toString().padStart(2, "0");
    }
    if (amPm === "AM" && h === 12) {
      return "00";
    }
    return h.toString().padStart(2, "0");
  };

  const updateMember = (index: number, field: keyof MemberInput, value: string | boolean) => {
    setMembers((prev) => {
      const clone = [...prev];
      if (field === "isLunar") {
        clone[index] = { ...clone[index], [field]: value === "true" || value === true };
      } else if (field === "birthTimeUnknown") {
        clone[index] = { ...clone[index], [field]: value === "true" || value === true };
        // birthTimeUnknown이 true면 birthTime을 비워줍니다
        if (value === "true" || value === true) {
          clone[index].birthTime = "";
          clone[index].birthHour = "";
          clone[index].birthMinute = "";
        }
      } else if (field === "birthAmPm" || field === "birthHour" || field === "birthMinute") {
        // 오전/오후, 시, 분 업데이트
        clone[index] = { ...clone[index], [field]: value as string };

        // birthTime을 HH:mm 형식으로 업데이트
        const amPm = field === "birthAmPm" ? (value as "AM" | "PM") : clone[index].birthAmPm || "AM";
        const hour = field === "birthHour" ? (value as string) : clone[index].birthHour || "";
        const minute = field === "birthMinute" ? (value as string) : clone[index].birthMinute || "";

        if (hour && minute) {
          const hour24 = convertTo24Hour(amPm, hour);
          clone[index].birthTime = `${hour24}:${minute.padStart(2, "0")}`;
        }

        // 시(hour)가 2자리가 되거나 10 이상이면 분(minute) 입력으로 자동 이동
        if (field === "birthHour" && value) {
          const hourNum = parseInt(value as string);
          const hourStr = value as string;
          if (hourStr.length === 2 || hourNum >= 10) {
            setTimeout(() => {
              minuteInputRefs.current[index]?.focus();
            }, 0);
          }
        }
      } else if (field === "birthYear") {
        // 연도는 4자리까지만 허용
        const yearValue = value as string;
        if (yearValue.length <= 4) {
          clone[index] = { ...clone[index], [field]: yearValue };

          // 연도가 4자리가 되면 월 입력으로 자동 이동
          if (yearValue.length === 4) {
            setTimeout(() => {
              monthInputRefs.current[index]?.focus();
            }, 0);
          }
        }
      } else if (field === "birthMonth") {
        // 월은 1~12만 허용
        const monthValue = value as string;
        const monthNum = parseInt(monthValue);
        if (monthValue === "" || (monthNum >= 1 && monthNum <= 12 && monthValue.length <= 2)) {
          clone[index] = { ...clone[index], [field]: monthValue };

          // 월이 변경되면 일자가 유효한지 확인
          const currentDay = parseInt(clone[index].birthDay);
          if (currentDay) {
            const maxDays = getDaysInMonth(clone[index].birthYear, monthValue);
            if (currentDay > maxDays) {
              clone[index].birthDay = maxDays.toString();
            }
          }

          // 월이 2자리가 되거나 10 이상이면 일 입력으로 자동 이동
          if (monthValue.length === 2 || monthNum >= 10) {
            setTimeout(() => {
              dayInputRefs.current[index]?.focus();
            }, 0);
          }
        }
      } else if (field === "birthDay") {
        // 해당 월의 최대 일수까지만 허용
        const dayValue = value as string;
        const dayNum = parseInt(dayValue);
        const maxDays = getDaysInMonth(clone[index].birthYear, clone[index].birthMonth);

        if (dayValue === "" || (dayNum >= 1 && dayNum <= maxDays && dayValue.length <= 2)) {
          clone[index] = { ...clone[index], [field]: dayValue };
        }
      } else {
        clone[index] = { ...clone[index], [field]: value as string };
      }
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
        <h2 className="text-lg font-semibold">팀원 정보</h2>
        {members.map((member, index) => (
          <div key={index} className="space-y-3 border border-slate-200 rounded-md p-3">
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

            {/* 생년월일 입력 (년/월/일 순서) */}
            <div>
              <label className="block text-xs text-slate-600 mb-1">생년월일</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="rounded border border-slate-300 px-3 py-2"
                  placeholder="년 (YYYY)"
                  value={member.birthYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    updateMember(index, "birthYear", value);
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
                <input
                  ref={(el) => {
                    monthInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="rounded border border-slate-300 px-3 py-2"
                  placeholder="월 (MM)"
                  value={member.birthMonth}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    updateMember(index, "birthMonth", value);
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
                <input
                  ref={(el) => {
                    dayInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="rounded border border-slate-300 px-3 py-2"
                  placeholder="일 (DD)"
                  value={member.birthDay}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    updateMember(index, "birthDay", value);
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>
            </div>

            {/* 양력/음력 선택 */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`calendar-${index}`}
                  checked={!member.isLunar}
                  onChange={() => updateMember(index, "isLunar", "false")}
                  className="w-4 h-4"
                />
                <span className="text-sm">양력</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`calendar-${index}`}
                  checked={member.isLunar}
                  onChange={() => updateMember(index, "isLunar", "true")}
                  className="w-4 h-4"
                />
                <span className="text-sm">음력</span>
              </label>
            </div>

            {/* 태어난 시 입력 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-600">태어난 시</label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={member.birthTimeUnknown}
                    onChange={(e) => updateMember(index, "birthTimeUnknown", e.target.checked ? "true" : "false")}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-slate-500">모름</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  className="rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                  value={member.birthAmPm || "AM"}
                  onChange={(e) => updateMember(index, "birthAmPm", e.target.value)}
                  disabled={member.birthTimeUnknown}
                >
                  <option value="AM">오전</option>
                  <option value="PM">오후</option>
                </select>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                  placeholder="시 (1-12)"
                  value={member.birthHour || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    const num = parseInt(val);
                    if (val === "" || (num >= 1 && num <= 12 && val.length <= 2)) {
                      updateMember(index, "birthHour", val);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  disabled={member.birthTimeUnknown}
                />
                <input
                  ref={(el) => {
                    minuteInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                  placeholder="분 (0-59)"
                  value={member.birthMinute || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    const num = parseInt(val);
                    if (val === "" || (num >= 0 && num <= 59 && val.length <= 2)) {
                      updateMember(index, "birthMinute", val);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  disabled={member.birthTimeUnknown}
                />
              </div>
            </div>
          </div>
        ))}

        {/* 팀원 추가 버튼 */}
        <button
          type="button"
          onClick={addMember}
          className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-md text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>팀원 추가</span>
        </button>
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
