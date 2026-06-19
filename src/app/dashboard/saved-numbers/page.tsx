import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";
import { SavedNumbersClient } from "./SavedNumbersClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved Numbers" };

export default async function SavedNumbersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?from=/dashboard/saved-numbers");

  const saved = await prisma.savedNumber.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-text-muted hover:text-text-primary text-sm transition-colors">
            ← Dashboard
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary text-sm font-medium">Saved Numbers</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-text-primary">Saved Numbers</h1>
            <p className="text-text-muted text-sm mt-1">Quick-access numbers for faster checkout</p>
          </div>
        </div>

        <SavedNumbersClient initialNumbers={saved} />

        <GlassPanel className="mt-8 p-5 flex gap-3 items-start">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-medium text-text-primary">Quick Tip</p>
            <p className="text-xs text-text-muted mt-0.5">
              Save your family and friends&apos; numbers here. During checkout, you can pick from your saved list instead of typing every time.
            </p>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
