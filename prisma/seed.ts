import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed global pricing config (15% default markup)
  await prisma.pricingConfig.upsert({
    where: { id: "global-default" },
    update: {},
    create: {
      id: "global-default",
      isGlobal: true,
      isResellerTier: false,
      markupPercent: 15,
    },
  });

  // Seed reseller pricing tier (8% markup)
  await prisma.pricingConfig.upsert({
    where: { id: "reseller-tier" },
    update: {},
    create: {
      id: "reseller-tier",
      isGlobal: true,
      isResellerTier: true,
      markupPercent: 8,
    },
  });

  // Seed admin user (change password in production!)
  const adminPassword = await bcrypt.hash("admin123!", 12);
  await prisma.user.upsert({
    where: { phone: "0200000000" },
    update: {},
    create: {
      name: "Admin",
      phone: "0200000000",
      email: "admin@tamaldata.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      referralCode: "TAML-ADMIN",
    },
  });

  console.log("✓ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
