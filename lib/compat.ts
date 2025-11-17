import {
  ElementProfile,
  controlMap,
  dominantElement,
  elementKeyMap,
  nourishMap,
  profileInsights,
} from "@/lib/elements";

export type PairCompatibility = {
  memberAId: string;
  memberBId: string;
  score: number;
  strengths: string[];
  risks: string[];
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const PAIR_SCALE = 50;

const directionalScore = (source: ElementProfile, target: ElementProfile) => {
  const dominant = dominantElement(source);
  const nourishKey = elementKeyMap[nourishMap[dominant]];
  const controlKey = elementKeyMap[controlMap[dominant]];
  return target[nourishKey] - target[controlKey];
};

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
