"use client";

import type { FeatureRequest } from "@/lib/types";

const statusColor: Record<string, string> = {
  queued: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  building: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  testing: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  shipped: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  reverted: "bg-zinc-700/40 text-zinc-400 border-zinc-600",
  failed: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  approved: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
};

export function QueuePanel({
  queue,
  onShip,
  onRevert,
  busy,
}: {
  queue: FeatureRequest[];
  onShip: (id: string) => void;
  onRevert?: (widgetId: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Ship queue</h3>
        <span className="text-xs text-zinc-500">{queue.length} items</span>
      </div>
      <ul className="space-y-3">
        {queue.length === 0 && (
          <li className="text-sm text-zinc-500">No redemptions yet. Chat can redeem “Ship a Feature”.</li>
        )}
        {[...queue].reverse().map((q) => (
          <li key={q.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">@{q.viewer}</div>
                <div className="mt-0.5 text-sm text-zinc-400">“{q.prompt}”</div>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColor[q.status]}`}>
                {q.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.status === "queued" && (
                <button
                  disabled={busy}
                  onClick={() => onShip(q.id)}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
                >
                  !ship
                </button>
              )}
              {q.status === "shipped" && q.widgetId && onRevert && (
                <button
                  onClick={() => onRevert(q.widgetId!)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/5"
                >
                  !revert
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
