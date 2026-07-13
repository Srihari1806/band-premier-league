import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">{eyebrow}</p>
        )}
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}
