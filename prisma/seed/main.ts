import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { validateParticipationRules } from "../../domain/participations/participation.rules";
import { seasonYearFromDate } from "../../domain/utils/index.js";
import { type Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { Argon2PasswordHasher } from "../../infrastructure/auth/argon2-password-hasher.js";
import type { RoleEnum } from "../../shared/db-enums.js";
import { seedLinkedArchers, seedUnlinkedArcherNames } from "./data/archers.js";
import { seedCompetitions } from "./data/competitions.js";
import { addDaysUtc, utcDateOnly } from "./lib/dates.js";
import {
  distanceAndTargetForSeed,
  payerPaymentForSeed,
  registrationStatusForSeed,
  weaponForSeed,
} from "./lib/participation-for-seed.js";

const COLORS = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DIRECT_URL or DATABASE_URL for seeding.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const pickArchersForCompetition = (
  competitionIndex: number,
  archerIds: readonly string[],
): string[] => {
  const count = 5 + (competitionIndex % 3);
  const start = (competitionIndex * 7) % archerIds.length;
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(archerIds[(start + i) % archerIds.length] ?? "");
  }
  return [...new Set(picked)];
};

const main = async () => {
  await prisma.participation.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.archer.deleteMany();
  await prisma.token.deleteMany();
  await prisma.auth_user_role.deleteMany();
  await prisma.auth_user.deleteMany();

  const authRows: { id: string; role: RoleEnum }[] = [];
  for (const spec of seedLinkedArchers) {
    const u = await prisma.auth_user.create({
      data: {
        name: spec.name,
        email: spec.email,
        password: null,
        authenticated: true,
        roles: {
          create: { role: spec.role },
        },
      },
    });
    authRows.push({ id: u.id, role: spec.role });
  }

  /**
   * Seed the first user with a hashed password
   */
  const seedDevPassword = process.env.SEED_DEV_PASSWORD;
  if (seedDevPassword && authRows.length > 0) {
    const argon2 = new Argon2PasswordHasher();
    const passwordHash = await argon2.hash(seedDevPassword);
    const firstAuthId = authRows.find((u) => u.role === "developer")?.id;
    if (firstAuthId) {
      await prisma.auth_user.update({
        where: { id: firstAuthId },
        data: { password: passwordHash },
      });
    }
  }

  const archerIds: string[] = [];

  for (let i = 0; i < seedLinkedArchers.length; i++) {
    const spec = seedLinkedArchers[i];
    const auth = authRows[i];
    if (!spec || !auth) {
      throw new Error("seedLinkedArchers / authRows length mismatch");
    }

    const inserted = await prisma.archer.create({
      data: {
        public_name: spec.name,
        auth_user_id: auth.id,
      },
    });

    const id = inserted.id;
    if (!id) {
      throw new Error(`Insert failed for archer ${spec.name}`);
    }
    archerIds.push(id);
  }

  for (const name of seedUnlinkedArcherNames) {
    const inserted = await prisma.archer.create({
      data: {
        public_name: name,
      },
    });

    const id = inserted.id;
    if (!id) {
      throw new Error(`Insert failed for archer ${name}`);
    }
    archerIds.push(id);
  }

  const baseline = utcDateOnly(new Date());

  const competitionIds: string[] = [];

  for (const spec of seedCompetitions) {
    const startDate = utcDateOnly(addDaysUtc(baseline, spec.startOffset));
    const endDate = utcDateOnly(addDaysUtc(baseline, spec.endOffset));
    const seasonYear = seasonYearFromDate(startDate);
    const row = await prisma.competition.create({
      data: {
        name: spec.name,
        place: spec.place,
        price: spec.price,
        category: spec.category,
        type: spec.type,
        is_championship: spec.isChampionship,
        season_year: seasonYear,
        start_date: startDate,
        end_date: endDate,
      },
    });
    competitionIds.push(row.id);
  }

  const participationPayload: Prisma.participationCreateManyInput[] = [];

  for (let i = 0; i < competitionIds.length; i++) {
    const competitionId = competitionIds[i];
    const spec = seedCompetitions[i];
    if (!competitionId || !spec) {
      throw new Error("competition row / spec mismatch");
    }
    if (spec.emptyParticipations) {
      continue;
    }

    const archers = pickArchersForCompetition(i, archerIds);

    let aIndex = 0;
    for (const archerId of archers) {
      const salt = i * 31 + aIndex * 17;
      const { distance, target } = distanceAndTargetForSeed(
        spec.category,
        spec.type,
        salt,
      );
      const { payer, paymentStatus } = payerPaymentForSeed(salt);
      const registrationStatus = registrationStatusForSeed(salt + 3);
      const weapon = weaponForSeed(salt + 5);

      const rule = validateParticipationRules({
        category: spec.category,
        type: spec.type,
        payer,
        paymentStatus,
        distance,
        target,
      });

      if (!rule.valid) {
        throw new Error(`Seed rule violation for ${spec.name}: ${rule.reason}`);
      }

      participationPayload.push({
        archer_id: archerId,
        competition_id: competitionId,
        registration_status: registrationStatus,
        payment_status: paymentStatus,
        payer,
        distance,
        target,
        weapon,
      });
      aIndex += 1;
    }
  }

  if (participationPayload.length > 0) {
    await prisma.participation.createMany({ data: participationPayload });
  }

  console.log(`${COLORS.cyan}${"=".repeat(76)}${COLORS.reset}`);
  console.log();

  console.log(
    `${COLORS.green}Seeding completed: ${COLORS.yellow}${authRows.length}${COLORS.green} users, ${COLORS.yellow}${archerIds.length}${COLORS.green} archers, ${COLORS.yellow}${competitionIds.length}${COLORS.green} competitions, ${COLORS.yellow}${participationPayload.length}${COLORS.green} participations.${COLORS.reset}`,
  );
  console.log();
  console.log(`${COLORS.cyan}${"=".repeat(76)}${COLORS.reset}`);
  console.log();
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
