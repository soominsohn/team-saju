import { randomUUID } from "crypto";

import { z } from "zod";

import {
  EarthlyBranch,
  GanJiChart,
  HeavenlyStem,
  calculateElementProfile,
  deriveGanJiFromBirth,
  dominantElement,
  profileInsights,
  profileToRecord,
  summarizeTenGods,
  topTenGods,
} from "@/lib/elements";
import { computePairCompatibility, computeEnhancedCompatibility } from "@/lib/compat";
import { prisma } from "@/lib/prisma";
import { analyzeBranchRelations } from "@/lib/relations";
import { scoreTeam } from "@/lib/team";
import { deriveRole, analyzeTeamRoles, type RoleProfile } from "@/lib/roles";
import { generateTeamInsights } from "@/lib/insights";

const memberInputSchema = z.object({
  displayName: z.string().min(1).max(50),
  birthDate: z.string(),
  birthTime: z.string().optional(),
});

const createPayloadSchema = z.object({
  teamName: z.string().min(1),
  purpose: z.string().optional().nullable(),
  members: z.array(memberInputSchema).min(1),
});

export type CreateTeamPayload = z.infer<typeof createPayloadSchema>;

const mapChartRecord = (chart?: {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourStem: string | null;
  hourBranch: string | null;
}): GanJiChart | null => {
  if (!chart) return null;
  return {
    yearStem: chart.yearStem as HeavenlyStem,
    yearBranch: chart.yearBranch as EarthlyBranch,
    monthStem: chart.monthStem as HeavenlyStem,
    monthBranch: chart.monthBranch as EarthlyBranch,
    dayStem: chart.dayStem as HeavenlyStem,
    dayBranch: chart.dayBranch as EarthlyBranch,
    hourStem: chart.hourStem ? (chart.hourStem as HeavenlyStem) : undefined,
    hourBranch: chart.hourBranch ? (chart.hourBranch as EarthlyBranch) : undefined,
  };
};

export async function createTeamWithReport(payload: CreateTeamPayload) {
  const parsed = createPayloadSchema.parse(payload);

  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: parsed.teamName,
        purpose: parsed.purpose ?? null,
        ownerId: null,
        shareToken: randomUUID(),
        expiresAt: null,
      },
    });

    const memberDetails: {
      memberId: string;
      displayName: string;
      birthDate: string;
      birthTime?: string;
      dominant: string;
      profile: ReturnType<typeof profileToRecord>;
      chart: {
        yearStem: string;
        yearBranch: string;
        monthStem: string;
        monthBranch: string;
        dayStem: string;
        dayBranch: string;
        hourStem?: string;
        hourBranch?: string;
      };
      insights: ReturnType<typeof profileInsights>;
      tenGodHighlights: string[];
      role: RoleProfile;
      dayBranch: EarthlyBranch;
    }[] = [];

    for (const member of parsed.members) {
      const chart = deriveGanJiFromBirth({
        birthDate: member.birthDate,
        birthTime: member.birthTime,
      });
      const profile = calculateElementProfile(chart);
      const insights = profileInsights(profile);
      const dominant = dominantElement(profile);
      const tenGodProfile = summarizeTenGods(chart);
      const tenGodHighlights = topTenGods(tenGodProfile);
      const role = deriveRole(chart, profile, tenGodProfile);

      const memberRecord = await tx.member.create({
        data: {
          teamId: team.id,
          displayName: member.displayName,
          birthDate: new Date(`${member.birthDate}T00:00:00.000Z`),
          birthTime: member.birthTime ?? null,
          timezone: "Asia/Seoul",
        },
      });

      await tx.chart.create({
        data: {
          memberId: memberRecord.id,
          yearStem: chart.yearStem,
          yearBranch: chart.yearBranch,
          monthStem: chart.monthStem,
          monthBranch: chart.monthBranch,
          dayStem: chart.dayStem,
          dayBranch: chart.dayBranch,
          hourStem: chart.hourStem ?? null,
          hourBranch: chart.hourBranch ?? null,
        },
      });

      await tx.elementProfile.create({
        data: {
          memberId: memberRecord.id,
          ...profileToRecord(profile),
          dominant,
        },
      });

      memberDetails.push({
        memberId: memberRecord.id,
        displayName: member.displayName,
        birthDate: member.birthDate,
        birthTime: member.birthTime,
        dominant,
        profile: profileToRecord(profile),
        chart: {
          yearStem: chart.yearStem,
          yearBranch: chart.yearBranch,
          monthStem: chart.monthStem,
          monthBranch: chart.monthBranch,
          dayStem: chart.dayStem,
          dayBranch: chart.dayBranch,
          hourStem: chart.hourStem,
          hourBranch: chart.hourBranch,
        },
        insights,
        tenGodHighlights,
        role,
        dayBranch: chart.dayBranch,
      });
    }

    const profiles = memberDetails.map((member) => member.profile);
    const teamScore = scoreTeam(profiles);

    await tx.teamScore.create({
      data: {
        teamId: team.id,
        balanceIdx: teamScore.balanceIdx,
        nourishIdx: teamScore.nourishIdx,
        conflictIdx: teamScore.conflictIdx,
        roleCoverage: teamScore.roleCoverage,
        finalScore: teamScore.finalScore,
      },
    });

    const pairScores = [];
    const enhancedPairScores = [];

    for (let i = 0; i < memberDetails.length; i += 1) {
      for (let j = i + 1; j < memberDetails.length; j += 1) {
        const memberA = memberDetails[i];
        const memberB = memberDetails[j];

        // 강화된 궁합 계산 (chart와 role 정보 사용)
        const chartA = {
          yearStem: memberA.chart.yearStem as HeavenlyStem,
          yearBranch: memberA.chart.yearBranch as EarthlyBranch,
          monthStem: memberA.chart.monthStem as HeavenlyStem,
          monthBranch: memberA.chart.monthBranch as EarthlyBranch,
          dayStem: memberA.chart.dayStem as HeavenlyStem,
          dayBranch: memberA.chart.dayBranch as EarthlyBranch,
          hourStem: memberA.chart.hourStem as HeavenlyStem | undefined,
          hourBranch: memberA.chart.hourBranch as EarthlyBranch | undefined,
        };

        const chartB = {
          yearStem: memberB.chart.yearStem as HeavenlyStem,
          yearBranch: memberB.chart.yearBranch as EarthlyBranch,
          monthStem: memberB.chart.monthStem as HeavenlyStem,
          monthBranch: memberB.chart.monthBranch as EarthlyBranch,
          dayStem: memberB.chart.dayStem as HeavenlyStem,
          dayBranch: memberB.chart.dayBranch as EarthlyBranch,
          hourStem: memberB.chart.hourStem as HeavenlyStem | undefined,
          hourBranch: memberB.chart.hourBranch as EarthlyBranch | undefined,
        };

        const enhanced = computeEnhancedCompatibility(
          chartA,
          memberA.profile,
          memberA.role,
          chartB,
          memberB.profile,
          memberB.role,
        );

        // DB 저장용 (기존 형식 유지)
        const pair = {
          memberAId: memberA.memberId,
          memberBId: memberB.memberId,
          score: enhanced.score,
          strengths: enhanced.insights.strengths,
          risks: enhanced.insights.risks,
        };
        pairScores.push(pair);

        // API 응답용 (breakdown 포함)
        enhancedPairScores.push({
          memberA: memberA.memberId,
          memberB: memberB.memberId,
          score: enhanced.score,
          strengths: enhanced.insights.strengths,
          risks: enhanced.insights.risks,
          breakdown: enhanced.breakdown,
          recommendations: enhanced.insights.recommendations,
        });
      }
    }

    if (pairScores.length) {
      await tx.pairScore.createMany({
        data: pairScores.map((pair) => ({
          teamId: team.id,
          memberA: pair.memberAId,
          memberB: pair.memberBId,
          score: pair.score,
          strengths: pair.strengths,
          risks: pair.risks,
        })),
      });
    }

    const branchRelations = analyzeBranchRelations(
      memberDetails.map((member) => ({
        memberId: member.memberId,
        displayName: member.displayName,
        branch: member.dayBranch,
      })),
    );

    // 팀 역할 분포 분석
    const roleProfiles = memberDetails.map((member) => member.role);
    const roleDistribution = analyzeTeamRoles(roleProfiles);

    const publicMembers = memberDetails.map(({ dayBranch, ...rest }) => rest);

    // 팀 인사이트 생성
    const insightsData = memberDetails.map((member) => ({
      memberId: member.memberId,
      displayName: member.displayName,
      profile: member.profile,
      role: member.role,
    }));

    const insights = generateTeamInsights(
      insightsData,
      enhancedPairScores,
      branchRelations,
    );

    return {
      team,
      memberSummaries: publicMembers,
      teamScore,
      pairScores: enhancedPairScores,
      dynamics: {
        branchRelations,
      },
      roleDistribution,
      insights,
    };
  });
}

export async function getTeamReport(teamId: string, shareToken?: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      teamScores: true,
      pairScores: true,
      members: {
        include: {
          elements: true,
          chart: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error("TEAM_NOT_FOUND");
  }

  if (shareToken && team.shareToken !== shareToken) {
    throw new Error("FORBIDDEN");
  }

  const relationSeeds: Array<{ memberId: string; displayName: string; branch: EarthlyBranch }> = [];

  const memberSummaries = team.members.map((member) => {
    const profile = member.elements
      ? {
          wood: member.elements.wood,
          fire: member.elements.fire,
          earth: member.elements.earth,
          metal: member.elements.metal,
          water: member.elements.water,
        }
      : { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const insights = profileInsights(profile);
    const chart = mapChartRecord(member.chart as any);
    const tenGodProfile = chart ? summarizeTenGods(chart) : undefined;
    const tenGodHighlights = tenGodProfile ? topTenGods(tenGodProfile) : [];
    const role = chart && tenGodProfile ? deriveRole(chart, profile, tenGodProfile) : undefined;

    if (chart) {
      relationSeeds.push({
        memberId: member.id,
        displayName: member.displayName,
        branch: chart.dayBranch,
      });
    }
    return {
      memberId: member.id,
      displayName: member.displayName,
      birthDate: member.birthDate.toISOString().split('T')[0], // YYYY-MM-DD format
      birthTime: member.birthTime || undefined,
      dominant: member.elements?.dominant ?? "unknown",
      profile,
      chart: member.chart ? {
        yearStem: member.chart.yearStem,
        yearBranch: member.chart.yearBranch,
        monthStem: member.chart.monthStem,
        monthBranch: member.chart.monthBranch,
        dayStem: member.chart.dayStem,
        dayBranch: member.chart.dayBranch,
        hourStem: member.chart.hourStem || undefined,
        hourBranch: member.chart.hourBranch || undefined,
      } : undefined,
      insights,
      tenGodHighlights,
      role,
    };
  });

  const teamScore = team.teamScores
    ? {
        balanceIdx: team.teamScores.balanceIdx,
        nourishIdx: team.teamScores.nourishIdx,
        conflictIdx: team.teamScores.conflictIdx,
        roleCoverage: team.teamScores.roleCoverage,
        finalScore: team.teamScores.finalScore,
      }
    : scoreTeam(memberSummaries.map((member) => member.profile));

  // 강화된 궁합 점수 재계산
  const enhancedPairScores = [];
  for (let i = 0; i < memberSummaries.length; i += 1) {
    for (let j = i + 1; j < memberSummaries.length; j += 1) {
      const memberA = memberSummaries[i];
      const memberB = memberSummaries[j];

      // chart가 있는 경우에만 강화된 궁합 계산
      if (memberA.chart && memberB.chart) {
        const chartA = {
          yearStem: memberA.chart.yearStem as HeavenlyStem,
          yearBranch: memberA.chart.yearBranch as EarthlyBranch,
          monthStem: memberA.chart.monthStem as HeavenlyStem,
          monthBranch: memberA.chart.monthBranch as EarthlyBranch,
          dayStem: memberA.chart.dayStem as HeavenlyStem,
          dayBranch: memberA.chart.dayBranch as EarthlyBranch,
          hourStem: memberA.chart.hourStem as HeavenlyStem | undefined,
          hourBranch: memberA.chart.hourBranch as EarthlyBranch | undefined,
        };

        const chartB = {
          yearStem: memberB.chart.yearStem as HeavenlyStem,
          yearBranch: memberB.chart.yearBranch as EarthlyBranch,
          monthStem: memberB.chart.monthStem as HeavenlyStem,
          monthBranch: memberB.chart.monthBranch as EarthlyBranch,
          dayStem: memberB.chart.dayStem as HeavenlyStem,
          dayBranch: memberB.chart.dayBranch as EarthlyBranch,
          hourStem: memberB.chart.hourStem as HeavenlyStem | undefined,
          hourBranch: memberB.chart.hourBranch as EarthlyBranch | undefined,
        };

        const enhanced = computeEnhancedCompatibility(
          chartA,
          memberA.profile,
          memberA.role,
          chartB,
          memberB.profile,
          memberB.role,
        );

        enhancedPairScores.push({
          memberA: memberA.memberId,
          memberB: memberB.memberId,
          score: enhanced.score,
          strengths: enhanced.insights.strengths,
          risks: enhanced.insights.risks,
          breakdown: enhanced.breakdown,
          recommendations: enhanced.insights.recommendations,
        });
      }
    }
  }

  const pairScores = enhancedPairScores;

  const branchRelations = analyzeBranchRelations(relationSeeds);

  // 팀 역할 분포 분석
  const roleProfiles = memberSummaries
    .map((member) => member.role)
    .filter((role): role is RoleProfile => role !== undefined);
  const roleDistribution = roleProfiles.length > 0 ? analyzeTeamRoles(roleProfiles) : undefined;

  // 팀 인사이트 생성
  const insightsData = memberSummaries.map((member) => ({
    memberId: member.memberId,
    displayName: member.displayName,
    profile: member.profile,
    role: member.role,
  }));

  const insights = generateTeamInsights(
    insightsData,
    pairScores,
    branchRelations,
  );

  return {
    team: {
      id: team.id,
      name: team.name,
      purpose: team.purpose,
      shareToken: team.shareToken,
    },
    memberSummaries,
    teamScore,
    pairScores,
    dynamics: {
      branchRelations,
    },
    roleDistribution,
    insights,
  };
}
