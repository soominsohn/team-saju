import { PrismaClient } from "@prisma/client";

import {
  calculateElementProfile,
  deriveGanJiFromBirth,
  dominantElement,
  profileToRecord,
} from "../lib/elements";

const prisma = new PrismaClient();

const seedMembers = [
  { displayName: "혁진", birthDate: "1990-02-14", birthTime: "08:00" },
  { displayName: "수민", birthDate: "1992-07-01", birthTime: "18:30" },
  { displayName: "윤아", birthDate: "1988-11-23", birthTime: "22:00" },
];

async function main() {
  await prisma.pairScore.deleteMany();
  await prisma.teamScore.deleteMany();
  await prisma.elementProfile.deleteMany();
  await prisma.chart.deleteMany();
  await prisma.member.deleteMany();
  await prisma.team.deleteMany();

  const team = await prisma.team.create({
    data: {
      name: "데모 팀",
      purpose: "우리팀 사주 리허설",
      ownerId: "demo-owner",
      shareToken: "demo-share-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  for (const member of seedMembers) {
    const chart = deriveGanJiFromBirth({
      birthDate: member.birthDate,
      birthTime: member.birthTime,
    });
    const profile = calculateElementProfile(chart);
    const dominant = dominantElement(profile);
    const memberRecord = await prisma.member.create({
      data: {
        teamId: team.id,
        displayName: member.displayName,
        birthDate: new Date(`${member.birthDate}T00:00:00.000Z`),
        birthTime: member.birthTime,
        timezone: "Asia/Seoul",
      },
    });

    await prisma.chart.create({
      data: {
        memberId: memberRecord.id,
        yearStem: chart.yearStem,
        yearBranch: chart.yearBranch,
        monthStem: chart.monthStem,
        monthBranch: chart.monthBranch,
        dayStem: chart.dayStem,
        dayBranch: chart.dayBranch,
        hourStem: chart.hourStem ?? null,
        hourBranch: chart.hourBranch ?? null,
      },
    });

    await prisma.elementProfile.create({
      data: {
        memberId: memberRecord.id,
        ...profileToRecord(profile),
        dominant,
      },
    });
  }

  console.log(`Seeded team ${team.name} (${team.id}) with ${seedMembers.length} members`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
