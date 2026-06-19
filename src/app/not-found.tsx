import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center text-center px-4">
      <div>
        <p className="text-8xl font-heading text-text-muted mb-4">404</p>
        <h1 className="text-2xl font-heading text-text-primary mb-3">
          Page not found
        </h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <GlowButton>Back to Home</GlowButton>
        </Link>
      </div>
    </main>
  );
}
