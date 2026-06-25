import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CopyButton } from "./CopyButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, referrals: { select: { name: true, createdAt: true } } },
  });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const commission = Number(settings?.referralCommission ?? 0.02) * 100;
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?ref=${user?.referralCode}`;

  return (
    <div className="container-content pt-28 pb-10 max-w-3xl">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-2">Referral Program</h1>
      <p className="text-text-secondary mb-8">
        Earn <span className="text-accent-primary font-semibold">{commission}%</span> commission on every order placed by people you refer.
      </p>

      {/* Referral link */}
      <GlassPanel className="p-6 mb-6">
        <h2 className="font-display font-semibold text-text-primary mb-3">Your Referral Link</h2>
        <div className="flex items-center gap-3">
          <input
            readOnly
            value={referralUrl}
            className="flex-1 bg-bg-elevated border border-color-border rounded-input px-4 py-3 font-mono text-sm text-text-primary focus:outline-none"
          />
          <CopyButton text={referralUrl} />
        </div>
        <p className="text-xs text-text-muted mt-3">
          Your code: <span className="font-mono text-accent-primary font-bold">{user?.referralCode}</span>
        </p>
      </GlassPanel>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Total Referrals</p>
          <p className="font-display font-bold text-2xl text-accent-primary">{user?.referrals.length ?? 0}</p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Your Commission Rate</p>
          <p className="font-display font-bold text-2xl text-color-success">{commission}%</p>
        </GlassPanel>
      </div>

      {/* Referrals list */}
      <GlassPanel className="overflow-hidden">
        <div className="px-4 py-3 border-b border-color-border/40">
          <h2 className="font-display font-semibold text-text-primary">Referred Users</h2>
        </div>
        {!user?.referrals.length ? (
          <div className="p-8 text-center text-text-muted text-sm">
            No referrals yet. Share your link to start earning!
          </div>
        ) : (
          <ul className="divide-y divide-color-border/20">
            {user.referrals.map((ref, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-text-primary font-medium">{ref.name}</span>
                <span className="text-xs text-text-muted">{new Date(ref.createdAt).toLocaleDateString("en-GH")}</span>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>
    </div>
  );
}
