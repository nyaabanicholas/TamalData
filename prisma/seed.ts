import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const ADMIN_EMAIL    = "admin@tamaldata.com";
const ADMIN_PASSWORD = "TamalAdmin2024!";
const ADMIN_PHONE    = "0200000000";

async function main() {
  // ── Pricing config ────────────────────────────────────────────────────
  await prisma.pricingConfig.upsert({
    where: { id: "global-default" },
    update: {},
    create: { id: "global-default", isGlobal: true, isResellerTier: false, markupPercent: 15 },
  });
  await prisma.pricingConfig.upsert({
    where: { id: "reseller-tier" },
    update: {},
    create: { id: "reseller-tier", isGlobal: true, isResellerTier: true, markupPercent: 8 },
  });

  // ── Admin Clerk user ──────────────────────────────────────────────────
  let clerkUserId: string;
  const existing = await clerk.users.getUserList({ emailAddress: [ADMIN_EMAIL] });
  if (existing.data.length > 0) {
    clerkUserId = existing.data[0].id;
    console.log("✓ Clerk admin user already exists:", clerkUserId);
  } else {
    const clerkUser = await clerk.users.createUser({
      emailAddress: [ADMIN_EMAIL],
      password: ADMIN_PASSWORD,
      firstName: "Admin",
      lastName: "TamalData",
      skipPasswordChecks: true,
    });
    clerkUserId = clerkUser.id;
    console.log("✓ Created Clerk admin user:", clerkUserId);
  }

  // ── Admin Prisma user ─────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { phone: ADMIN_PHONE },
    update: { clerkId: clerkUserId, email: ADMIN_EMAIL },
    create: {
      clerkId: clerkUserId,
      name: "Admin",
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      role: "ADMIN",
      referralCode: "TAML-ADMIN",
    },
  });

  console.log("✓ Seed complete");
  console.log(`  Admin email:    ${ADMIN_EMAIL}`);
  console.log(`  Admin password: ${ADMIN_PASSWORD}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
