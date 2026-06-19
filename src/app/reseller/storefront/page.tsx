import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontForm } from "./StorefrontForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Storefront" };

export default async function StorefrontPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const storefront = await prisma.resellerStorefront.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="container-content pt-4 pb-10 max-w-2xl">
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-2">Storefront</h1>
      <p className="text-text-secondary mb-8">
        Customise your public shop page. Share the link with customers to let them buy directly from you.
      </p>
      <StorefrontForm storefront={storefront} userId={session.user.id} />
    </div>
  );
}
