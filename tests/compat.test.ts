import { describe, expect, it } from "vitest";

import { computePairCompatibility } from "@/lib/compat";
import { calculateElementProfile, deriveGanJiFromBirth } from "@/lib/elements";

const profile = (date: string, time: string) =>
  calculateElementProfile(deriveGanJiFromBirth({ birthDate: date, birthTime: time }));

describe("pair compatibility", () => {
  it("returns a bounded score", () => {
    const a = profile("1990-01-10", "05:00");
    const b = profile("1992-11-03", "20:00");
    const result = computePairCompatibility("A", a, "B", b);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
