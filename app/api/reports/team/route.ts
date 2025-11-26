import { NextResponse } from "next/server";
import { z } from "zod";

import { createTeamWithReport } from "@/lib/services/reportService";

const memberSchema = z.object({
  displayName: z.string().min(1).max(50),
  birthDate: z.string().regex(/\d{4}-\d{2}-\d{2}/, "YYYY-MM-DD 형식이어야 합니다"),
  birthTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "HH:mm 형식이어야 합니다")
    .optional(),
});

const requestSchema = z.object({
  teamName: z.string().min(1).max(80),
  purpose: z.string().max(120).optional().nullable(),
  members: z.array(memberSchema).min(1, "최소 1명 이상의 팀원이 필요합니다"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = requestSchema.parse(json);

    const result = await createTeamWithReport({
      teamName: payload.teamName,
      purpose: payload.purpose,
      members: payload.members,
    });

    return NextResponse.json({
      teamId: result.team.id,
      teamName: payload.teamName,
      purpose: payload.purpose,
      shareToken: result.team.shareToken,
      teamScore: result.teamScore,
      members: result.memberSummaries,
      pairs: result.pairScores.map((pair) => ({
        memberA: pair.memberAId,
        memberB: pair.memberBId,
        score: pair.score,
        strengths: pair.strengths,
        risks: pair.risks,
      })),
      dynamics: result.dynamics,
      roleDistribution: result.roleDistribution,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "입력 값이 올바르지 않습니다", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
