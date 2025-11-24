import type { Element, TenGod } from "@/lib/elements";
import type { BranchRelationInsight } from "@/lib/relations";
import type { TeamIndices } from "@/lib/team";

export type MemberReport = {
  memberId: string;
  displayName: string;
  birthDate: string;
  birthTime?: string;
  dominant: string;
  profile: Record<string, number>;
  insights: {
    missing: Element[];
    skewed: Element[];
  };
  tenGodHighlights: TenGod[];
};

export type PairReport = {
  memberA: string;
  memberB: string;
  score: number;
  strengths: string[];
  risks: string[];
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
};
