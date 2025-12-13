import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getTeamReport, updateTeamWithReport } from "@/lib/services/reportService";

const memberSchema = z.object({
  displayName: z.string().min(1).max(50),
  birthDate: z.string().regex(/\d{4}-\d{2}-\d{2}/, "YYYY-MM-DD 형식이어야 합니다"),
  birthTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "HH:mm 형식이어야 합니다")
    .optional(),
  isLunar: z.boolean().optional(),
});

const updateRequestSchema = z.object({
  teamName: z.string().min(1).max(80),
  purpose: z.string().max(120).optional().nullable(),
  members: z.array(memberSchema).min(1, "최소 1명 이상의 팀원이 필요합니다"),
});

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const report = await getTeamReport(params.teamId);

    return NextResponse.json({
      teamId: report.team.id,
      teamName: report.team.name,
      purpose: report.team.purpose,
      donated: report.team.donated,
      teamScore: report.teamScore,
      members: report.memberSummaries,
      pairs: report.pairScores,
      dynamics: report.dynamics,
      roleDistribution: report.roleDistribution,
      insights: report.insights,
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

export async function PUT(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const json = await request.json();
    const payload = updateRequestSchema.parse(json);

    const result = await updateTeamWithReport(params.teamId, payload);

    return NextResponse.json({
      teamId: result.team.id,
      teamName: payload.teamName,
      purpose: payload.purpose,
      teamScore: result.teamScore,
      members: result.memberSummaries,
      pairs: result.pairScores,
      dynamics: result.dynamics,
      roleDistribution: result.roleDistribution,
      insights: result.insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "입력 값이 올바르지 않습니다", issues: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message === "TEAM_NOT_FOUND") {
        return NextResponse.json({ message: "팀을 찾을 수 없습니다" }, { status: 404 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ message: "수정 권한이 없습니다" }, { status: 403 });
      }
    }

    return NextResponse.json({ message: "알 수 없는 오류" }, { status: 500 });
  }
}
