import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SavedNumbersClient } from "./SavedNumbersClient";
import { prisma } from "@/lib/prisma";
import { Lightbulb } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved Numbers" };

export default async function SavedNumbersPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/dashboard/saved-numbers");

  const saved = await prisma.savedNumber.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl tracking-tight text-text-primary">Saved Numbers</h1>
            <p className="text-text-muted text-sm mt-1">Quick-access numbers for faster checkout</p>
          </div>
        </div>

        <SavedNumbersClient initialNumbers={saved} />

        <GlassPanel className="mt-8 p-5 flex gap-3 items-start">
          <IconTile icon={Lightbulb} className="mx-0 mb-0 h-10 w-10 rounded-xl" />
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
