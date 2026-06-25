"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function AdminSignOutButton({ className }: { className?: string }) {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
