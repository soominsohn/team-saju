import { EarthlyBranch } from "@/lib/elements";

export type BranchRelationType = "clash" | "harm" | "combine" | "punish";

export type BranchRelationInsight = {
  type: BranchRelationType;
  members: [string, string];
  description: string;
};

const relationLabels: Record<BranchRelationType, string> = {
  clash: "상충",
  harm: "상해",
  combine: "합",
  punish: "형",
};

const relationDescriptions: Record<BranchRelationType, string> = {
  clash: "기운이 정면 충돌",
  harm: "상해 기운으로 소모",
  combine: "합으로 협업 증폭",
  punish: "형살 기운, 규칙 필요",
};

const relationPairs: Record<BranchRelationType, [EarthlyBranch, EarthlyBranch][]> = {
  clash: [
    [EarthlyBranch.JA, EarthlyBranch.O],
    [EarthlyBranch.CHUK, EarthlyBranch.MI],
    [EarthlyBranch.IN, EarthlyBranch.SIN],
    [EarthlyBranch.MYO, EarthlyBranch.YU],
    [EarthlyBranch.JIN, EarthlyBranch.SUL],
    [EarthlyBranch.SA, EarthlyBranch.HAE],
  ],
  harm: [
    [EarthlyBranch.JA, EarthlyBranch.MI],
    [EarthlyBranch.CHUK, EarthlyBranch.O],
    [EarthlyBranch.IN, EarthlyBranch.SA],
    [EarthlyBranch.MYO, EarthlyBranch.JIN],
    [EarthlyBranch.SIN, EarthlyBranch.HAE],
    [EarthlyBranch.YU, EarthlyBranch.SUL],
  ],
  combine: [
    [EarthlyBranch.JA, EarthlyBranch.CHUK],
    [EarthlyBranch.IN, EarthlyBranch.HAE],
    [EarthlyBranch.MYO, EarthlyBranch.SUL],
    [EarthlyBranch.JIN, EarthlyBranch.YU],
    [EarthlyBranch.SA, EarthlyBranch.SIN],
    [EarthlyBranch.O, EarthlyBranch.MI],
  ],
  punish: [
    [EarthlyBranch.IN, EarthlyBranch.SA],
    [EarthlyBranch.SA, EarthlyBranch.SIN],
    [EarthlyBranch.SIN, EarthlyBranch.IN],
    [EarthlyBranch.CHUK, EarthlyBranch.CHUK],
    [EarthlyBranch.O, EarthlyBranch.O],
    [EarthlyBranch.YU, EarthlyBranch.YU],
    [EarthlyBranch.HAE, EarthlyBranch.HAE],
  ],
};

const normalizePair = (
  a: EarthlyBranch,
  b: EarthlyBranch,
): [EarthlyBranch, EarthlyBranch] => (a <= b ? [a, b] : [b, a]);

const relationLookup: Array<{ type: BranchRelationType; pair: [EarthlyBranch, EarthlyBranch] }> = [];

(Object.keys(relationPairs) as BranchRelationType[]).forEach((type) => {
  relationPairs[type].forEach((pair) => {
    relationLookup.push({ type, pair: normalizePair(pair[0], pair[1]) });
  });
});

const detectRelation = (a: EarthlyBranch, b: EarthlyBranch): BranchRelationType | null => {
  const normalized = normalizePair(a, b);
  const found = relationLookup.find(
    (entry) => entry.pair[0] === normalized[0] && entry.pair[1] === normalized[1],
  );
  return found?.type ?? null;
};

export const analyzeBranchRelations = (
  members: Array<{ memberId: string; displayName: string; branch: EarthlyBranch }>,
  limit = 6,
): BranchRelationInsight[] => {
  const insights: BranchRelationInsight[] = [];
  for (let i = 0; i < members.length; i += 1) {
    for (let j = i + 1; j < members.length; j += 1) {
      const type = detectRelation(members[i].branch, members[j].branch);
      if (!type) continue;
      insights.push({
        type,
        members: [members[i].memberId, members[j].memberId],
        description: `${members[i].displayName}·${members[j].displayName} ${relationLabels[type]} — ${relationDescriptions[type]}`,
      });
    }
  }

  return insights.slice(0, limit);
};
