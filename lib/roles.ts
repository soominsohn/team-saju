import {
  Element,
  ElementProfile,
  GanJiChart,
  TenGod,
  TenGodProfile,
  dominantElement,
  elementKeyMap,
} from "@/lib/elements";

/**
 * 팀 내 역할 타입
 * 오행 기반으로 5가지 역할로 분류
 */
export enum TeamRole {
  LEADER = "leader",           // 火 과다 → 추진력, 실행력
  STRATEGIST = "strategist",   // 木 과다 → 기획, 성장, 아이디어
  COORDINATOR = "coordinator", // 土 과다 → 조율, 안정, PM
  ANALYST = "analyst",         // 金 과다 → 분석, 구조화, 개발
  COMMUNICATOR = "communicator" // 水 과다 → 소통, 유연, CX
}

/**
 * 역할 프로필
 */
export type RoleProfile = {
  primary: TeamRole;
  secondary?: TeamRole;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  intensity: number; // 0-100: 해당 역할의 강도
};

/**
 * 역할별 한글 레이블
 */
export const ROLE_LABELS: Record<TeamRole, string> = {
  [TeamRole.LEADER]: "리더형",
  [TeamRole.STRATEGIST]: "기획자형",
  [TeamRole.COORDINATOR]: "조율자형",
  [TeamRole.ANALYST]: "분석가형",
  [TeamRole.COMMUNICATOR]: "소통가형",
};

/**
 * 오행 → 역할 매핑
 */
const ELEMENT_TO_ROLE: Record<Element, TeamRole> = {
  [Element.FIRE]: TeamRole.LEADER,
  [Element.WOOD]: TeamRole.STRATEGIST,
  [Element.EARTH]: TeamRole.COORDINATOR,
  [Element.METAL]: TeamRole.ANALYST,
  [Element.WATER]: TeamRole.COMMUNICATOR,
};

/**
 * 역할별 강점 설명 템플릿
 */
const ROLE_STRENGTHS: Record<TeamRole, string[]> = {
  [TeamRole.LEADER]: [
    "강한 추진력과 실행력",
    "빠른 의사결정",
    "팀을 이끄는 카리스마",
    "목표 달성 집중력",
  ],
  [TeamRole.STRATEGIST]: [
    "창의적 아이디어 발상",
    "장기 전략 수립",
    "성장 지향적 사고",
    "새로운 기회 포착",
  ],
  [TeamRole.COORDINATOR]: [
    "팀 내 조율 및 중재",
    "안정적인 프로세스 관리",
    "갈등 해결 능력",
    "신뢰감 형성",
  ],
  [TeamRole.ANALYST]: [
    "논리적 분석력",
    "체계적인 구조화",
    "디테일 관리",
    "품질 중시",
  ],
  [TeamRole.COMMUNICATOR]: [
    "원활한 커뮤니케이션",
    "유연한 대응력",
    "공감 능력",
    "정보 전달 및 연결",
  ],
};

/**
 * 역할별 약점 설명 템플릿 (과다할 때)
 */
const ROLE_WEAKNESSES: Record<TeamRole, string[]> = {
  [TeamRole.LEADER]: [
    "성급한 결정 가능성",
    "번아웃 위험",
    "독단적 행동 주의",
  ],
  [TeamRole.STRATEGIST]: [
    "실행력 부족 가능성",
    "과도한 이상주의",
    "현실성 검토 필요",
  ],
  [TeamRole.COORDINATOR]: [
    "결정 지연 가능성",
    "과도한 타협",
    "우유부단함 주의",
  ],
  [TeamRole.ANALYST]: [
    "경직된 사고 가능성",
    "완벽주의로 인한 지연",
    "감정 표현 부족",
  ],
  [TeamRole.COMMUNICATOR]: [
    "우선순위 분산",
    "깊이 부족 가능성",
    "결론 도출 어려움",
  ],
};

/**
 * 역할별 추천 조언
 */
const ROLE_RECOMMENDATIONS: Record<TeamRole, string> = {
  [TeamRole.LEADER]: "프로젝트 리드, 영업, 대외 활동에 적합합니다. 단, 팀원 의견 청취와 휴식 시간 확보가 중요합니다.",
  [TeamRole.STRATEGIST]: "기획, 전략 수립, R&D에 적합합니다. 실행 파트너와 협업하면 시너지가 큽니다.",
  [TeamRole.COORDINATOR]: "PM, 팀 빌딩, 프로세스 관리에 적합합니다. 결단력 있는 리더와 함께하면 좋습니다.",
  [TeamRole.ANALYST]: "개발, 데이터 분석, 품질 관리에 적합합니다. 유연한 소통가와 짝을 이루면 균형이 잡힙니다.",
  [TeamRole.COMMUNICATOR]: "고객 응대, 마케팅, 대내외 협업에 적합합니다. 분석가의 도움으로 깊이를 더할 수 있습니다.",
};

/**
 * 십신 기반 역할 보정
 * 십신 분포를 고려해 역할을 미세 조정
 */
const TEN_GOD_ROLE_MODIFIERS: Record<TenGod, Partial<Record<TeamRole, number>>> = {
  [TenGod.FRIEND]: {
    [TeamRole.COORDINATOR]: 5,
    [TeamRole.LEADER]: 3,
  },
  [TenGod.ROB_WEALTH]: {
    [TeamRole.LEADER]: 5,
    [TeamRole.STRATEGIST]: 3,
  },
  [TenGod.FOOD_GOD]: {
    [TeamRole.STRATEGIST]: 8,
    [TeamRole.COMMUNICATOR]: 5,
  },
  [TenGod.HURTING_OFFICER]: {
    [TeamRole.ANALYST]: 5,
    [TeamRole.STRATEGIST]: 3,
  },
  [TenGod.DIRECT_WEALTH]: {
    [TeamRole.COORDINATOR]: 5,
    [TeamRole.ANALYST]: 3,
  },
  [TenGod.INDIRECT_WEALTH]: {
    [TeamRole.STRATEGIST]: 5,
    [TeamRole.LEADER]: 3,
  },
  [TenGod.DIRECT_OFFICER]: {
    [TeamRole.COORDINATOR]: 5,
    [TeamRole.ANALYST]: 3,
  },
  [TenGod.INDIRECT_OFFICER]: {
    [TeamRole.LEADER]: 5,
    [TeamRole.ANALYST]: 3,
  },
  [TenGod.DIRECT_RESOURCE]: {
    [TeamRole.COORDINATOR]: 5,
    [TeamRole.STRATEGIST]: 3,
  },
  [TenGod.INDIRECT_RESOURCE]: {
    [TeamRole.STRATEGIST]: 8,
    [TeamRole.COMMUNICATOR]: 5,
  },
};

/**
 * 오행 프로필을 기반으로 역할 점수 계산
 */
function calculateRoleScores(profile: ElementProfile): Record<TeamRole, number> {
  const scores: Record<TeamRole, number> = {
    [TeamRole.LEADER]: 0,
    [TeamRole.STRATEGIST]: 0,
    [TeamRole.COORDINATOR]: 0,
    [TeamRole.ANALYST]: 0,
    [TeamRole.COMMUNICATOR]: 0,
  };

  // 오행 기반 기본 점수 (0-100)
  Object.entries(ELEMENT_TO_ROLE).forEach(([element, role]) => {
    const elementValue = profile[elementKeyMap[element as Element]];
    scores[role] = elementValue * 100;
  });

  return scores;
}

/**
 * 십신 분포를 고려해 역할 점수 보정
 */
function applyTenGodModifiers(
  scores: Record<TeamRole, number>,
  tenGodProfile: TenGodProfile
): Record<TeamRole, number> {
  const adjustedScores = { ...scores };

  // 십신 중 상위 3개만 고려
  const topTenGods = (Object.keys(tenGodProfile) as TenGod[])
    .sort((a, b) => tenGodProfile[b] - tenGodProfile[a])
    .slice(0, 3);

  topTenGods.forEach((tenGod) => {
    const modifiers = TEN_GOD_ROLE_MODIFIERS[tenGod];
    if (!modifiers) return;

    Object.entries(modifiers).forEach(([role, modifier]) => {
      adjustedScores[role as TeamRole] += modifier || 0;
    });
  });

  return adjustedScores;
}

/**
 * 역할 프로필 도출
 * @param chart 간지 차트 (사용 안 할 수도 있지만 확장성 위해 포함)
 * @param profile 오행 프로필
 * @param tenGodProfile 십신 프로필
 * @returns RoleProfile
 */
export function deriveRole(
  chart: GanJiChart,
  profile: ElementProfile,
  tenGodProfile: TenGodProfile
): RoleProfile {
  // 1. 오행 기반 역할 점수 계산
  let roleScores = calculateRoleScores(profile);

  // 2. 십신 보정 적용
  roleScores = applyTenGodModifiers(roleScores, tenGodProfile);

  // 3. 1차 역할 결정 (가장 높은 점수)
  const sortedRoles = (Object.keys(roleScores) as TeamRole[]).sort(
    (a, b) => roleScores[b] - roleScores[a]
  );

  const primary = sortedRoles[0];
  const primaryScore = roleScores[primary];

  // 4. 2차 역할 결정 (1차와 점수 차이가 15 이내면 포함)
  const secondary =
    roleScores[sortedRoles[1]] >= primaryScore - 15 ? sortedRoles[1] : undefined;

  // 5. 강도 판단 (주체 오행의 비율)
  const dominant = dominantElement(profile);
  const dominantValue = profile[elementKeyMap[dominant]];
  const intensity = Math.min(dominantValue * 100, 100);

  // 6. 강점/약점 선택
  const strengths = ROLE_STRENGTHS[primary].slice(0, 3);
  const weaknesses =
    dominantValue > 0.35
      ? ROLE_WEAKNESSES[primary].slice(0, 2)
      : ["균형적인 성향으로 특별한 약점 없음"];

  // 7. 추천 생성
  const recommendation = ROLE_RECOMMENDATIONS[primary];

  return {
    primary,
    secondary,
    strengths,
    weaknesses,
    recommendation,
    intensity: Math.round(intensity),
  };
}

/**
 * 역할 타입을 한글로 변환
 */
export function getRoleLabel(role: TeamRole): string {
  return ROLE_LABELS[role];
}

/**
 * 여러 멤버의 역할 다양성 점수 계산 (0-100)
 * 5가지 역할이 고르게 분포되어 있을수록 높은 점수
 */
export function calculateRoleDiversity(roles: TeamRole[]): number {
  if (roles.length === 0) return 0;

  const roleCounts = new Map<TeamRole, number>();
  roles.forEach((role) => {
    roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
  });

  // 유니크한 역할 수 / 5 (최대 5가지)
  const uniqueRoles = roleCounts.size;
  const diversityScore = (uniqueRoles / 5) * 100;

  return Math.round(diversityScore);
}

/**
 * 팀 역할 분포 요약
 */
export type TeamRoleDistribution = {
  distribution: Record<TeamRole, number>;
  diversity: number;
  missing: TeamRole[];
  dominant: TeamRole | null;
};

export function analyzeTeamRoles(roleProfiles: RoleProfile[]): TeamRoleDistribution {
  const distribution: Record<TeamRole, number> = {
    [TeamRole.LEADER]: 0,
    [TeamRole.STRATEGIST]: 0,
    [TeamRole.COORDINATOR]: 0,
    [TeamRole.ANALYST]: 0,
    [TeamRole.COMMUNICATOR]: 0,
  };

  // 각 멤버의 primary role 카운트
  roleProfiles.forEach((profile) => {
    distribution[profile.primary] += 1;
  });

  // 다양성 점수
  const primaryRoles = roleProfiles.map((p) => p.primary);
  const diversity = calculateRoleDiversity(primaryRoles);

  // 부족한 역할 찾기
  const missing = (Object.keys(distribution) as TeamRole[]).filter(
    (role) => distribution[role] === 0
  );

  // 가장 많은 역할
  const dominant = (Object.keys(distribution) as TeamRole[]).reduce((a, b) =>
    distribution[a] > distribution[b] ? a : b
  );

  return {
    distribution,
    diversity,
    missing,
    dominant: distribution[dominant] > 0 ? dominant : null,
  };
}
