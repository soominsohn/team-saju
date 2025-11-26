import {dominantElement, Element, ElementProfile} from "@/lib/elements";
import type {BranchRelationInsight} from "@/lib/relations";
import {RoleProfile, TeamRole} from "@/lib/roles";

export type InsightCategory = "balance" | "energy" | "risk" | "opportunity";
export type InsightPriority = "high" | "medium" | "low";

export type TeamInsight = {
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  affectedMembers?: string[]; // 관련 멤버 이름
  recommendation?: string;
};

type MemberData = {
  memberId: string;
  displayName: string;
  profile: ElementProfile;
  role?: RoleProfile;
};

type PairScore = {
  memberA: string;
  memberB: string;
  score: number;
};

/**
 * 팀 전체 인사이트 생성
 */
export function generateTeamInsights(
  members: MemberData[],
  pairScores: PairScore[],
  branchRelations: BranchRelationInsight[],
): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 1. 팀 전체 오행 균형 분석
  insights.push(...analyzeTeamElementBalance(members));

  // 2. 팀 에너지 편중 분석
  insights.push(...analyzeTeamEnergyBias(members));

  // 3. 위험한 페어 관계 분석
  insights.push(...analyzeDangerousPairs(members, pairScores));

  // 4. 시너지 높은 페어 강조
  insights.push(...analyzeStrongPairs(members, pairScores));

  // 5. 역할 분포 분석
  insights.push(...analyzeRoleDistribution(members));

  // 6. 형충합해 관계 인사이트
  insights.push(...analyzeBranchRelationInsights(members, branchRelations));

  // 우선순위별 정렬 (high > medium > low)
  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * 팀 전체 오행 균형 분석
 */
function analyzeTeamElementBalance(members: MemberData[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 팀 전체 평균 오행 계산
  const avgProfile: ElementProfile = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  members.forEach((member) => {
    avgProfile.wood += member.profile.wood;
    avgProfile.fire += member.profile.fire;
    avgProfile.earth += member.profile.earth;
    avgProfile.metal += member.profile.metal;
    avgProfile.water += member.profile.water;
  });

  const count = members.length;
  avgProfile.wood /= count;
  avgProfile.fire /= count;
  avgProfile.earth /= count;
  avgProfile.metal /= count;
  avgProfile.water /= count;

  // 결핍된 오행 감지 (평균 < 0.15)
  const missingElements: Element[] = [];
  if (avgProfile.wood < 0.15) missingElements.push(Element.WOOD);
  if (avgProfile.fire < 0.15) missingElements.push(Element.FIRE);
  if (avgProfile.earth < 0.15) missingElements.push(Element.EARTH);
  if (avgProfile.metal < 0.15) missingElements.push(Element.METAL);
  if (avgProfile.water < 0.15) missingElements.push(Element.WATER);

  if (missingElements.length > 0) {
    const elementLabels: Record<Element, string> = {
      wood: "목(木)",
      fire: "화(火)",
      earth: "토(土)",
      metal: "금(金)",
      water: "수(水)",
    };

    const elementRoles: Record<Element, string> = {
      wood: "기획력과 성장 동력",
      fire: "추진력과 열정",
      earth: "조율과 안정성",
      metal: "분석력과 체계성",
      water: "소통과 유연성",
    };

    missingElements.forEach((element) => {
      insights.push({
        category: "balance",
        priority: missingElements.length >= 2 ? "high" : "medium",
        title: `팀에 ${elementLabels[element]} 기운이 부족합니다`,
        description: `${elementRoles[element]}이 부족할 수 있습니다. 해당 기운을 가진 인재 보강을 고려하세요.`,
        recommendation: `${elementLabels[element]} 기운이 강한 멤버를 추가하거나, 기존 멤버들이 해당 역할을 의식적으로 보완하세요.`,
      });
    });
  }

  // 극단적 편중 감지 (평균 > 0.35)
  const dominantElements: Element[] = [];
  if (avgProfile.wood > 0.35) dominantElements.push(Element.WOOD);
  if (avgProfile.fire > 0.35) dominantElements.push(Element.FIRE);
  if (avgProfile.earth > 0.35) dominantElements.push(Element.EARTH);
  if (avgProfile.metal > 0.35) dominantElements.push(Element.METAL);
  if (avgProfile.water > 0.35) dominantElements.push(Element.WATER);

  if (dominantElements.length > 0) {
    const elementLabels: Record<Element, string> = {
      wood: "목(木)",
      fire: "화(火)",
      earth: "토(土)",
      metal: "금(金)",
      water: "수(水)",
    };

    const elementWarnings: Record<Element, string> = {
      wood: "과도한 확장 지향으로 실행력 부족 우려",
      fire: "번아웃 위험, 지속 가능성 점검 필요",
      earth: "안정 지향이 강해 혁신 동력 저하 가능",
      metal: "과도한 분석으로 실행 지연 우려",
      water: "유연성이 지나쳐 일관성 부족 가능",
    };

    dominantElements.forEach((element) => {
      insights.push({
        category: "risk",
        priority: "medium",
        title: `팀에 ${elementLabels[element]} 기운이 과다합니다`,
        description: elementWarnings[element],
        recommendation: `팀 운영 시 의식적으로 균형을 맞추고, 부족한 기운을 보완하는 프로세스를 도입하세요.`,
      });
    });
  }

  // 완벽한 균형 (모든 오행이 0.15~0.25 범위)
  const isBalanced = Object.values(avgProfile).every((val) => val >= 0.15 && val <= 0.25);
  if (isBalanced) {
    insights.push({
      category: "opportunity",
      priority: "low",
      title: "팀 오행 균형이 매우 좋습니다",
      description: "모든 오행이 고르게 분포되어 있어 다양한 상황에 유연하게 대응할 수 있습니다.",
      recommendation: "현재의 균형을 유지하며, 각 기운의 강점을 최대한 활용하세요.",
    });
  }

  return insights;
}

/**
 * 팀 에너지 편중 분석
 */
function analyzeTeamEnergyBias(members: MemberData[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 전체 멤버의 주체오행 분포
  const dominantCounts: Record<string, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  members.forEach((member) => {
    const dominant = dominantElement(member.profile);
    dominantCounts[dominant] = (dominantCounts[dominant] || 0) + 1;
  });

  const totalMembers = members.length;

  // 특정 주체오행이 50% 이상인 경우
  Object.entries(dominantCounts).forEach(([element, count]) => {
    if (count / totalMembers >= 0.5) {
      const elementLabels: Record<string, string> = {
        wood: "목(木)",
        fire: "화(火)",
        earth: "토(土)",
        metal: "금(金)",
        water: "수(水)",
      };

      insights.push({
        category: "energy",
        priority: "high",
        title: `팀원 절반 이상이 ${elementLabels[element]} 주체입니다`,
        description: `${count}명/${totalMembers}명이 ${elementLabels[element]} 기운을 주체로 합니다. 팀 성향이 한쪽으로 치우칠 수 있습니다.`,
        recommendation: "다양한 관점과 접근법을 의식적으로 도입하여 균형을 맞추세요.",
      });
    }
  });

  return insights;
}

/**
 * 위험한 페어 관계 분석
 */
function analyzeDangerousPairs(members: MemberData[], pairScores: PairScore[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 점수 30 이하인 위험 페어 찾기
  const dangerousPairs = pairScores.filter((pair) => pair.score < 30);

  if (dangerousPairs.length > 0) {
    dangerousPairs.forEach((pair) => {
      const memberAName =
        members.find((m) => m.memberId === pair.memberA)?.displayName ?? "알 수 없음";
      const memberBName =
        members.find((m) => m.memberId === pair.memberB)?.displayName ?? "알 수 없음";

      // 중재자 찾기 (둘 다와 궁합이 괜찮은 사람)
      const mediators = members
        .filter((m) => m.memberId !== pair.memberA && m.memberId !== pair.memberB)
        .filter((m) => {
          const scoreWithA = pairScores.find(
            (p) =>
              (p.memberA === m.memberId && p.memberB === pair.memberA) ||
              (p.memberB === m.memberId && p.memberA === pair.memberA),
          )?.score;
          const scoreWithB = pairScores.find(
            (p) =>
              (p.memberA === m.memberId && p.memberB === pair.memberB) ||
              (p.memberB === m.memberId && p.memberA === pair.memberB),
          )?.score;

          return (scoreWithA ?? 0) >= 50 && (scoreWithB ?? 0) >= 50;
        })
        .map((m) => m.displayName);

      insights.push({
        category: "risk",
        priority: "high",
        title: `${memberAName}와 ${memberBName}의 궁합이 낮습니다 (${pair.score.toFixed(0)}점)`,
        description: "두 멤버 간 갈등 가능성이 높습니다. 직접적인 협업을 최소화하는 것이 좋습니다.",
        affectedMembers: [memberAName, memberBName],
        recommendation:
          mediators.length > 0
            ? `${mediators.join(", ")}가 중재 역할을 맡는 것을 권장합니다.`
            : "팀 미팅 시 퍼실리테이터를 두거나, 명확한 소통 규칙을 설정하세요.",
      });
    });
  }

  return insights;
}

/**
 * 시너지 높은 페어 강조
 */
function analyzeStrongPairs(members: MemberData[], pairScores: PairScore[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 점수 80 이상인 최고 시너지 페어 찾기
  const strongPairs = pairScores.filter((pair) => pair.score >= 80);

  if (strongPairs.length > 0) {
    // 가장 높은 점수의 페어만 선택
    const topPair = strongPairs.reduce((prev, current) =>
      prev.score > current.score ? prev : current,
    );

    const memberAName =
      members.find((m) => m.memberId === topPair.memberA)?.displayName ?? "알 수 없음";
    const memberBName =
      members.find((m) => m.memberId === topPair.memberB)?.displayName ?? "알 수 없음";

    insights.push({
      category: "opportunity",
      priority: "medium",
      title: `${memberAName}와 ${memberBName}의 시너지가 뛰어납니다 (${topPair.score.toFixed(0)}점)`,
      description: "두 멤버가 함께 협업하면 높은 성과를 기대할 수 있습니다.",
      affectedMembers: [memberAName, memberBName],
      recommendation: "중요한 프로젝트나 의사결정 시 두 멤버를 함께 배치하세요.",
    });
  }

  return insights;
}

/**
 * 역할 분포 분석
 */
function analyzeRoleDistribution(members: MemberData[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  const rolesWithMembers = members.filter((m) => m.role);

  if (rolesWithMembers.length === 0) {
    return insights;
  }

  // 역할별 카운트
  const roleCounts: Record<string, number> = {};
  rolesWithMembers.forEach((m) => {
    const role = m.role!.primary;
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const roleLabels: Record<TeamRole, string> = {
    leader: "리더",
    strategist: "기획자",
    coordinator: "조율자",
    analyst: "분석가",
    communicator: "소통가",
  };

  // 역할이 하나도 없는 경우
  const allRoles: TeamRole[] = [TeamRole.LEADER, TeamRole.STRATEGIST, TeamRole.COORDINATOR, TeamRole.ANALYST, TeamRole.COMMUNICATOR];
  const missingRoles = allRoles.filter((role) => !roleCounts[role]);

  if (missingRoles.length > 0) {
    const missingRoleNames = missingRoles.map((role) => roleLabels[role]).join(", ");
    insights.push({
      category: "balance",
      priority: missingRoles.length >= 3 ? "high" : "medium",
      title: `팀에 ${missingRoleNames} 역할이 부재합니다`,
      description: "특정 역할이 없어 팀 운영에 공백이 생길 수 있습니다.",
      recommendation: "부재한 역할을 의식적으로 보완하거나, 해당 역할을 수행할 수 있는 인재를 보강하세요.",
    });
  }

  // 특정 역할이 과다한 경우 (3명 이상)
  Object.entries(roleCounts).forEach(([role, count]) => {
    if (count >= 3 && members.length >= 4) {
      insights.push({
        category: "risk",
        priority: "low",
        title: `${roleLabels[role as TeamRole]} 역할이 과다합니다 (${count}명)`,
        description: "동일 역할이 많아 역할 분담이 불명확하거나 중복될 수 있습니다.",
        recommendation: "각자의 세부 역할을 명확히 구분하거나, 다양한 역할을 시도하도록 유도하세요.",
      });
    }
  });

  return insights;
}

/**
 * 형충합해 관계 인사이트
 */
function analyzeBranchRelationInsights(
  members: MemberData[],
  branchRelations: BranchRelationInsight[],
): TeamInsight[] {
  const insights: TeamInsight[] = [];

  // 충(clash) 관계가 있는 경우
  const clashes = branchRelations.filter((r) => r.type === "clash");
  if (clashes.length > 0) {
    clashes.forEach((clash) => {
      const affectedNames = clash.members
        .map((memberId) => members.find((m) => m.memberId === memberId)?.displayName)
        .filter(Boolean) as string[];

      insights.push({
        category: "risk",
        priority: "medium",
        title: `${affectedNames.join("과 ")} 간 상충(沖) 관계`,
        description: clash.description,
        affectedMembers: affectedNames,
        recommendation: "갈등 상황 시 감정적 대응보다는 논리적 소통을 우선하세요.",
      });
    });
  }

  // 합(combine) 관계가 있는 경우
  const combines = branchRelations.filter((r) => r.type === "combine");
  if (combines.length > 0) {
    combines.forEach((combine) => {
      const affectedNames = combine.members
        .map((memberId) => members.find((m) => m.memberId === memberId)?.displayName)
        .filter(Boolean) as string[];

      insights.push({
        category: "opportunity",
        priority: "low",
        title: `${affectedNames.join("과 ")} 간 합(合) 관계`,
        description: combine.description,
        affectedMembers: affectedNames,
        recommendation: "두 멤버가 협력하면 시너지를 발휘할 수 있습니다.",
      });
    });
  }

  return insights;
}
