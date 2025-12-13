import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
    });

    if (!team) {
      return NextResponse.json({ message: "팀을 찾을 수 없습니다" }, { status: 404 });
    }

    // donated를 true로 업데이트
    const updatedTeam = await prisma.team.update({
      where: { id: params.teamId },
      data: { donated: true },
    });

    return NextResponse.json({
      success: true,
      donated: updatedTeam.donated,
      message: "후원해주셔서 감사합니다!"
    });
  } catch (error) {
    console.error("Donation error:", error);
    return NextResponse.json({ message: "알 수 없는 오류" }, { status: 500 });
  }
}
