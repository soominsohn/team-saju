import {
  ElementProfile,
  GanJiChart,
  HeavenlyStem,
  EarthlyBranch,
  controlMap,
  dominantElement,
  elementKeyMap,
  nourishMap,
  profileInsights,
} from "@/lib/elements";
import { TeamRole, type RoleProfile } from "@/lib/roles";

/**
 * 강화된 궁합 점수 (세부 breakdown 포함)
 */
export type EnhancedPairScore = {
  score: number; // 0-100 최종 점수
  breakdown: {
    elementHarmony: number;     // 오행 상생/상극 점수 (±20)
    roleCompatibility: number;  // 성향 조합 점수 (±15)
    ganjiHarmony: number;       // 천간/지지 합충 점수 (±25)
    elementBalance: number;     // 기운 균형 보정 (±10)
  };
  insights: {
    strengths: string[];
    risks: string[];
    recommendations: string[];
  };
};

export type PairCompatibility = {
  memberAId: string;
  memberBId: string;
  score: number;
  strengths: string[];
  risks: string[];
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const PAIR_SCALE = 50;

/**
 * 천간 합(合) - 조화로운 결합
 * 甲己合, 乙庚合, 丙辛合, 丁壬合, 戊癸合
 */
const STEM_HARMONY_PAIRS: Array<[HeavenlyStem, HeavenlyStem]> = [
  [HeavenlyStem.GAP, HeavenlyStem.GI],       // 甲己合 (목토합)
  [HeavenlyStem.EUL, HeavenlyStem.GYEONG],   // 乙庚合 (목금합)
  [HeavenlyStem.BYEONG, HeavenlyStem.SIN],   // 丙辛合 (화금합)
  [HeavenlyStem.JEONG, HeavenlyStem.IM],     // 丁壬合 (화수합)
  [HeavenlyStem.MU, HeavenlyStem.GYE],       // 戊癸合 (토수합)
];

/**
 * 천간 충(沖) - 정면 충돌
 * 甲庚沖, 乙辛沖, 丙壬沖, 丁癸沖, 戊己(무충)
 */
const STEM_CLASH_PAIRS: Array<[HeavenlyStem, HeavenlyStem]> = [
  [HeavenlyStem.GAP, HeavenlyStem.GYEONG],   // 甲庚沖
  [HeavenlyStem.EUL, HeavenlyStem.SIN],      // 乙辛沖
  [HeavenlyStem.BYEONG, HeavenlyStem.IM],    // 丙壬沖
  [HeavenlyStem.JEONG, HeavenlyStem.GYE],    // 丁癸沖
];

/**
 * 지지 삼합(三合) - 강력한 조화
 * 申子辰(수국), 亥卯未(목국), 寅午戌(화국), 巳酉丑(금국)
 */
const BRANCH_TRIPLE_HARMONY: Array<[EarthlyBranch, EarthlyBranch, EarthlyBranch]> = [
  [EarthlyBranch.SIN, EarthlyBranch.JA, EarthlyBranch.JIN],     // 申子辰 수국
  [EarthlyBranch.HAE, EarthlyBranch.MYO, EarthlyBranch.MI],     // 亥卯未 목국
  [EarthlyBranch.IN, EarthlyBranch.O, EarthlyBranch.SUL],       // 寅午戌 화국
  [EarthlyBranch.SA, EarthlyBranch.YU, EarthlyBranch.CHUK],     // 巳酉丑 금국
];

/**
 * 지지 육합(六合) - 조화로운 결합
 */
const BRANCH_SIX_HARMONY_PAIRS: Array<[EarthlyBranch, EarthlyBranch]> = [
  [EarthlyBranch.JA, EarthlyBranch.CHUK],    // 子丑合
  [EarthlyBranch.IN, EarthlyBranch.HAE],     // 寅亥合
  [EarthlyBranch.MYO, EarthlyBranch.SUL],    // 卯戌合
  [EarthlyBranch.JIN, EarthlyBranch.YU],     // 辰酉合
  [EarthlyBranch.SA, EarthlyBranch.SIN],     // 巳申合
  [EarthlyBranch.O, EarthlyBranch.MI],       // 午未合
];

/**
 * 역할 시너지 매트릭스
 * 두 역할이 만났을 때의 협업 점수 (-10 ~ +10)
 */
const ROLE_SYNERGY: Record<TeamRole, Partial<Record<TeamRole, number>>> = {
  [TeamRole.LEADER]: {
    [TeamRole.STRATEGIST]: 8,      // 리더 + 기획자 = 좋은 조합
    [TeamRole.COORDINATOR]: 5,     // 리더 + 조율자 = 보통
    [TeamRole.ANALYST]: 3,         // 리더 + 분석가 = 다소 충돌 가능
    [TeamRole.COMMUNICATOR]: 6,    // 리더 + 소통가 = 좋음
  },
  [TeamRole.STRATEGIST]: {
    [TeamRole.LEADER]: 8,
    [TeamRole.COORDINATOR]: 4,
    [TeamRole.ANALYST]: 7,         // 기획자 + 분석가 = 좋은 조합
    [TeamRole.COMMUNICATOR]: 5,
  },
  [TeamRole.COORDINATOR]: {
    [TeamRole.LEADER]: 5,
    [TeamRole.STRATEGIST]: 4,
    [TeamRole.ANALYST]: 6,
    [TeamRole.COMMUNICATOR]: 7,    // 조율자 + 소통가 = 좋은 조합
  },
  [TeamRole.ANALYST]: {
    [TeamRole.LEADER]: 3,
    [TeamRole.STRATEGIST]: 7,
    [TeamRole.COORDINATOR]: 6,
    [TeamRole.COMMUNICATOR]: 4,
  },
  [TeamRole.COMMUNICATOR]: {
    [TeamRole.LEADER]: 6,
    [TeamRole.STRATEGIST]: 5,
    [TeamRole.COORDINATOR]: 7,
    [TeamRole.ANALYST]: 4,
  },
};

/**
 * 두 천간이 합(合) 관계인지 확인
 */
function checkStemHarmony(stemA: HeavenlyStem, stemB: HeavenlyStem): boolean {
  return STEM_HARMONY_PAIRS.some(
    ([s1, s2]) => (s1 === stemA && s2 === stemB) || (s1 === stemB && s2 === stemA)
  );
}

/**
 * 두 천간이 충(沖) 관계인지 확인
 */
function checkStemClash(stemA: HeavenlyStem, stemB: HeavenlyStem): boolean {
  return STEM_CLASH_PAIRS.some(
    ([s1, s2]) => (s1 === stemA && s2 === stemB) || (s1 === stemB && s2 === stemA)
  );
}

/**
 * 두 지지가 육합(六合) 관계인지 확인
 */
function checkBranchSixHarmony(branchA: EarthlyBranch, branchB: EarthlyBranch): boolean {
  return BRANCH_SIX_HARMONY_PAIRS.some(
    ([b1, b2]) => (b1 === branchA && b2 === branchB) || (b1 === branchB && b2 === branchA)
  );
}

/**
 * 세 지지가 삼합(三合)을 이루는지 확인 (2인이므로 부분 삼합만 체크)
 */
function checkBranchPartialTriple(branchA: EarthlyBranch, branchB: EarthlyBranch): boolean {
  return BRANCH_TRIPLE_HARMONY.some((triple) =>
    triple.includes(branchA) && triple.includes(branchB)
  );
}

const directionalScore = (source: ElementProfile, target: ElementProfile) => {
  const dominant = dominantElement(source);
  const nourishKey = elementKeyMap[nourishMap[dominant]];
  const controlKey = elementKeyMap[controlMap[dominant]];
  return target[nourishKey] - target[controlKey];
};

/**
 * 강화된 궁합 점수 계산
 * 천간/지지 합충, 역할 시너지, 오행 균형 등을 모두 고려
 */
export function computeEnhancedCompatibility(
  chartA: GanJiChart,
  profileA: ElementProfile,
  roleA: RoleProfile | undefined,
  chartB: GanJiChart,
  profileB: ElementProfile,
  roleB: RoleProfile | undefined,
): EnhancedPairScore {
  // 1. 오행 상생/상극 점수 (±20)
  const rawElement = directionalScore(profileA, profileB) + directionalScore(profileB, profileA);
  const elementHarmony = clamp(rawElement * 20, -20, 20);

  // 2. 천간/지지 합충 점수 (±25)
  let ganjiHarmony = 0;
  const ganjiInsights: string[] = [];

  // 일간 천간 합충 체크
  if (checkStemHarmony(chartA.dayStem, chartB.dayStem)) {
    ganjiHarmony += 15;
    ganjiInsights.push("일간이 합(合)을 이루어 조화롭습니다");
  } else if (checkStemClash(chartA.dayStem, chartB.dayStem)) {
    ganjiHarmony -= 15;
    ganjiInsights.push("일간이 충(沖)을 이루어 긴장감이 있습니다");
  }

  // 일지 지지 육합/삼합 체크
  if (checkBranchSixHarmony(chartA.dayBranch, chartB.dayBranch)) {
    ganjiHarmony += 10;
    ganjiInsights.push("일지가 육합을 이루어 협력이 원활합니다");
  } else if (checkBranchPartialTriple(chartA.dayBranch, chartB.dayBranch)) {
    ganjiHarmony += 8;
    ganjiInsights.push("일지가 삼합 기운이 있어 시너지가 좋습니다");
  }

  ganjiHarmony = clamp(ganjiHarmony, -25, 25);

  // 3. 역할 시너지 점수 (±15)
  let roleCompatibility = 0;
  const roleInsights: string[] = [];

  if (roleA && roleB) {
    const synergy = ROLE_SYNERGY[roleA.primary]?.[roleB.primary] ?? 0;
    roleCompatibility = synergy > 5 ? 15 : synergy < 3 ? -10 : 5;

    if (synergy >= 7) {
      roleInsights.push(`${roleA.primary}와 ${roleB.primary}는 최고의 협업 조합입니다`);
    } else if (synergy <= 3) {
      roleInsights.push(`${roleA.primary}와 ${roleB.primary}는 서로 보완이 필요합니다`);
    }
  }

  roleCompatibility = clamp(roleCompatibility, -15, 15);

  // 4. 오행 균형 보정 (±10)
  const insightA = profileInsights(profileA);
  const insightB = profileInsights(profileB);
  let elementBalance = 0;
  const balanceInsights: string[] = [];

  // A의 결핍을 B가 보완하는지 체크
  insightA.missing.forEach((missingElement) => {
    const key = elementKeyMap[missingElement];
    if (profileB[key] > 0.25) {
      elementBalance += 5;
      balanceInsights.push(`B가 A의 부족한 ${missingElement} 기운을 보완합니다`);
    }
  });

  // B의 결핍을 A가 보완하는지 체크
  insightB.missing.forEach((missingElement) => {
    const key = elementKeyMap[missingElement];
    if (profileA[key] > 0.25) {
      elementBalance += 5;
      balanceInsights.push(`A가 B의 부족한 ${missingElement} 기운을 보완합니다`);
    }
  });

  elementBalance = clamp(elementBalance, -10, 10);

  // 5. 최종 점수 계산
  const totalScore = 50 + elementHarmony + roleCompatibility + ganjiHarmony + elementBalance;
  const finalScore = clamp(totalScore, 0, 100);

  // 6. 인사이트 생성
  const strengths: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  if (elementHarmony > 10) {
    strengths.push("오행 상생 흐름이 강해 자연스러운 협력이 가능합니다");
  } else if (elementHarmony < -10) {
    risks.push("오행 상극이 강해 의견 조율이 필요합니다");
    recommendations.push("중재자 역할을 두거나 정기적인 소통 시간을 가지세요");
  }

  strengths.push(...ganjiInsights.filter((_, i) => i < 2));
  strengths.push(...roleInsights);
  strengths.push(...balanceInsights.slice(0, 2));

  if (ganjiHarmony < -10) {
    risks.push("일간/일지 충돌로 인해 갈등이 발생할 수 있습니다");
    recommendations.push("의사결정 시 제3자의 의견을 구하는 것이 좋습니다");
  }

  if (roleCompatibility < 0) {
    recommendations.push("서로의 역할과 강점을 명확히 인지하고 존중하세요");
  }

  if (finalScore > 70) {
    strengths.push("매우 좋은 궁합입니다");
  } else if (finalScore < 40) {
    risks.push("주의가 필요한 조합입니다");
    recommendations.push("명확한 역할 분담과 소통 규칙이 중요합니다");
  }

  return {
    score: Number(finalScore.toFixed(2)),
    breakdown: {
      elementHarmony: Number(elementHarmony.toFixed(2)),
      roleCompatibility: Number(roleCompatibility.toFixed(2)),
      ganjiHarmony: Number(ganjiHarmony.toFixed(2)),
      elementBalance: Number(elementBalance.toFixed(2)),
    },
    insights: {
      strengths,
      risks,
      recommendations,
    },
  };
}

export const computePairCompatibility = (
  memberAId: string,
  profileA: ElementProfile,
  memberBId: string,
  profileB: ElementProfile,
): PairCompatibility => {
  const raw = directionalScore(profileA, profileB) + directionalScore(profileB, profileA);
  const score = clamp(50 + raw * PAIR_SCALE);

  const strengths: string[] = [];
  const risks: string[] = [];

  if (raw > 0) {
    strengths.push("상생 흐름이 우세합니다");
  } else if (raw < 0) {
    risks.push("상극 영향이 높아 조율이 필요합니다");
  }

  const insightA = profileInsights(profileA);
  const insightB = profileInsights(profileB);

  if (insightA.missing.length) {
    strengths.push(`A 결핍(${insightA.missing.join(",")})을 B가 보완`);
  }
  if (insightB.missing.length) {
    strengths.push(`B 결핍(${insightB.missing.join(",")})을 A가 보완`);
  }

  return {
    memberAId,
    memberBId,
    score: Number(score.toFixed(2)),
    strengths,
    risks,
  };
};
