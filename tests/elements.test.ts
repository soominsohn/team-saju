import { describe, expect, it } from "vitest";

import {
  calculateElementProfile,
  deriveGanJiFromBirth,
  dominantElement,
  profileInsights,
  summarizeTenGods,
  topTenGods,
} from "@/lib/elements";
import { scoreTeam } from "@/lib/team";

const sampleBirths = [
  { birthDate: "1992-08-14", birthTime: "06:00" },
  { birthDate: "1988-03-02", birthTime: "18:00" },
  { birthDate: "1995-11-30", birthTime: "23:30" },
];

describe("elements core", () => {
  it("derives 간지 chart deterministically", () => {
    const chart = deriveGanJiFromBirth(sampleBirths[0]);
    expect(chart.yearStem).toBeDefined();
    expect(chart.dayBranch).toBeDefined();
  });

  it("produces normalized element profile", () => {
    const chart = deriveGanJiFromBirth(sampleBirths[0]);
    const profile = calculateElementProfile(chart);
    const total =
      profile.wood + profile.fire + profile.earth + profile.metal + profile.water;
    expect(Math.abs(total - 1)).toBeLessThan(1e-6);
    expect(dominantElement(profile)).toBeDefined();
  });

  it("returns missing/skewed insights", () => {
    const chart = deriveGanJiFromBirth(sampleBirths[1]);
    const profile = calculateElementProfile(chart);
    const insight = profileInsights(profile);
    expect(Array.isArray(insight.missing)).toBeTruthy();
  });

  it("summarizes ten gods distribution", () => {
    const chart = deriveGanJiFromBirth(sampleBirths[2]);
    const tenGodProfile = summarizeTenGods(chart);
    const highlights = topTenGods(tenGodProfile);
    expect(highlights.length).toBeGreaterThan(0);
  });
});

describe("team scoring", () => {
  it("aggregates team metrics", () => {
    const profiles = sampleBirths.map((birth) =>
      calculateElementProfile(deriveGanJiFromBirth(birth)),
    );
    const teamScore = scoreTeam(profiles);
    expect(teamScore.finalScore).toBeGreaterThanOrEqual(0);
    expect(teamScore.finalScore).toBeLessThanOrEqual(100);
  });
});
