// Auth shim — backed by Supabase. All callsites import { auth } from "@/lib/auth" unchanged.
export { auth } from "@/lib/session";
export type { AppSession, AppUser } from "@/lib/session";
