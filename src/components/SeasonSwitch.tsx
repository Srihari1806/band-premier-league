/**
 * The season selector.
 *
 * Season 1 is AP/TS alone and season 2 is the national five. Those are two
 * genuinely different documents — a different roster, a different calendar,
 * a different number of nights — so every page that describes a season says
 * which one it is describing rather than quietly showing the national shape.
 */

import { CalendarRange } from "lucide-react";
import { SEASON_PLANS, type SeasonId } from "@/data/season-plan";

export function SeasonSwitch({
  value,
  onChange,
  className = "",
}: {
  value: SeasonId;
  onChange: (id: SeasonId) => void;
  className?: string;
}) {
  const active = SEASON_PLANS.find((p) => p.id === value) ?? SEASON_PLANS[0];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
          <CalendarRange size={12} className="text-primary-glow" /> Season
        </span>
        {SEASON_PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            title={p.note}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition cursor-pointer ${
              value === p.id
                ? "border-primary/60 bg-primary/15 text-primary-glow"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-white hover:border-primary/40"
            }`}
          >
            {p.label}
            <span className="ml-1.5 opacity-70 tabular-nums font-normal">{p.bands} bands</span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
        <span className="font-semibold text-white">
          {active.year} · {active.headline}.
        </span>{" "}
        {active.note}
      </p>
    </div>
  );
}
