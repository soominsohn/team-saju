import {
  Element,
  ElementProfile,
  controlMap,
  dominantElement,
  elementEnumByKey,
  elementKeyMap,
  elementKeys,
  nourishMap,
} from "./elements";

export type TeamIndices = {
  balanceIdx: number;
  nourishIdx: number;
  conflictIdx: number;
  roleCoverage: number;
  finalScore: number;
};

export type MemberSummary = {
  displayName: string;
  dominant: Element;
  profile: ElementProfile;
  insights: {
    missing: Element[];
    skewed: Element[];
  };
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const aggregateProfiles = (profiles: ElementProfile[]): ElementProfile => {
  const total = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  } satisfies ElementProfile;

  profiles.forEach((profile) => {
    total.wood += profile.wood;
    total.fire += profile.fire;
    total.earth += profile.earth;
    total.metal += profile.metal;
    total.water += profile.water;
  });

  const count = profiles.length || 1;
  return {
    wood: total.wood / count,
    fire: total.fire / count,
    earth: total.earth / count,
    metal: total.metal / count,
    water: total.water / count,
  };
};

const entropy = (profile: ElementProfile): number => {
  const values = Object.values(profile).filter((value) => value > 0);
  if (!values.length) return 0;
  const ent = -values.reduce((sum, value) => sum + value * Math.log(value) / Math.log(5), 0);
  return ent * 100;
};

const nourishFlow = (profile: ElementProfile): number => {
  const sum = elementKeys.reduce((acc, key) => {
    const element = elementEnumByKey[key];
    const nourishKey = elementKeyMap[nourishMap[element]];
    return acc + Math.min(profile[key], profile[nourishKey]);
  }, 0);
  return (sum / elementKeys.length) * 100;
};

const conflictPenalty = (profile: ElementProfile): number => {
  let total = 0;
  elementKeys.forEach((key) => {
    const element = elementEnumByKey[key];
    const controlKey = elementKeyMap[controlMap[element]];
    total += profile[key] * profile[controlKey];
  });
  return (1 - Math.min(total, 1)) * 100;
};

const roleCoverage = (profiles: ElementProfile[]): number => {
  const dominants = new Set(profiles.map((profile) => dominantElement(profile)));
  return (dominants.size / 5) * 100;
};

export const scoreTeam = (profiles: ElementProfile[]): TeamIndices => {
  if (!profiles.length) {
    return {
      balanceIdx: 0,
      nourishIdx: 0,
      conflictIdx: 0,
      roleCoverage: 0,
      finalScore: 0,
    };
  }

  const aggregate = aggregateProfiles(profiles);
  const balanceIdx = entropy(aggregate);
  const nourishIdx = nourishFlow(aggregate);
  const conflictIdx = conflictPenalty(aggregate);
  const roleCoverageScore = roleCoverage(profiles);

  const finalScore = clamp(
    balanceIdx * 0.25 + nourishIdx * 0.35 + conflictIdx * 0.25 + roleCoverageScore * 0.15,
  );

  return {
    balanceIdx: Number(balanceIdx.toFixed(2)),
    nourishIdx: Number(nourishIdx.toFixed(2)),
    conflictIdx: Number(conflictIdx.toFixed(2)),
    roleCoverage: Number(roleCoverageScore.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
  };
};
