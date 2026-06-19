import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = (session?.user as never as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") redirect("/auth/login");

  let settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "singleton" },
    });
  }

  return (
    <div className="container-content py-10 max-w-xl">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-2">Site Settings</h1>
      <p className="text-text-secondary mb-8">Configure global platform behaviour.</p>
      <SettingsForm settings={{ ...settings, referralCommission: Number(settings.referralCommission), minPayoutAmount: Number(settings.minPayoutAmount) }} />
    </div>
  );
}
