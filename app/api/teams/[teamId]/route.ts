import { NextRequest, NextResponse } from "next/server";

import { getTeamReport } from "@/lib/services/reportService";

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const url = new URL(request.url);
    const shareToken = url.searchParams.get("token") ?? undefined;
    const report = await getTeamReport(params.teamId, shareToken);

    return NextResponse.json({
      teamId: report.team.id,
      teamName: report.team.name,
      purpose: report.team.purpose,
      shareToken: report.team.shareToken,
      teamScore: report.teamScore,
      members: report.memberSummaries,
      pairs: report.pairScores,
      dynamics: report.dynamics,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TEAM_NOT_FOUND") {
        return NextResponse.json({ message: "팀을 찾을 수 없습니다" }, { status: 404 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ message: "조회 권한이 없습니다" }, { status: 403 });
      }
    }

    return NextResponse.json({ message: "알 수 없는 오류" }, { status: 500 });
  }
}
