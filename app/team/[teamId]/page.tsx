import { notFound } from "next/navigation";

import { ResultPanel } from "@/components/report/ResultPanel";
import type { TeamReportResponse } from "@/types/report";

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export default async function TeamReportPage({
  params,
  searchParams,
}: {
  params: { teamId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const baseUrl = resolveBaseUrl();
  const query = token ? `?token=${token}` : "";

  const response = await fetch(`${baseUrl}/api/teams/${params.teamId}${query}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("리포트를 불러오는 중 오류가 발생했습니다");
  }

  const report: TeamReportResponse = await response.json();

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">팀 리포트 뷰어</p>
        <h1 className="text-3xl font-semibold">{report.teamName}</h1>
        {report.purpose && <p className="text-slate-600">목적: {report.purpose}</p>}
      </header>
      <ResultPanel result={report} shareToken={token || report.shareToken || null} shareMode="minimal" />
    </section>
  );
}
