import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: "USER" | "RESELLER" | "ADMIN";
      walletBalance: number;
    } & DefaultSession["user"];
  }

  interface User {
    phone: string;
    role: "USER" | "RESELLER" | "ADMIN";
    walletBalance: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    role: string;
    walletBalance: number;
  }
}
