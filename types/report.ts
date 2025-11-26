import type { Element, TenGod } from "@/lib/elements";
import type { BranchRelationInsight } from "@/lib/relations";
import type { TeamIndices } from "@/lib/team";
import type { RoleProfile, TeamRoleDistribution } from "@/lib/roles";
import type { TeamInsight } from "@/lib/insights";

export type MemberReport = {
  memberId: string;
  displayName: string;
  birthDate: string;
  birthTime?: string;
  dominant: string;
  profile: Record<string, number>;
  chart?: {
    yearStem: string;
    yearBranch: string;
    monthStem: string;
    monthBranch: string;
    dayStem: string;
    dayBranch: string;
    hourStem?: string;
    hourBranch?: string;
  };
  insights: {
    missing: Element[];
    skewed: Element[];
  };
  tenGodHighlights: TenGod[];
  role?: RoleProfile;
};

export type PairReport = {
  memberA: string;
  memberB: string;
  score: number;
  strengths: string[];
  risks: string[];
  breakdown?: {
    elementHarmony: number;
    roleCompatibility: number;
    ganjiHarmony: number;
    elementBalance: number;
  };
  recommendations?: string[];
};

export type TeamReportResponse = {
  teamId: string;
  teamName: string;
  purpose?: string | null;
  shareToken?: string;
  teamScore: TeamIndices;
  members: MemberReport[];
  pairs: PairReport[];
  dynamics?: {
    branchRelations: BranchRelationInsight[];
  };
  roleDistribution?: TeamRoleDistribution;
  insights?: TeamInsight[];
};
