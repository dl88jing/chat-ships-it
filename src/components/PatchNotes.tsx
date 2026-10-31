"use client";

import type { PatchNote } from "@/lib/types";

export function PatchNotes({ notes }: { notes: PatchNote[] }) {
  const latest = notes.slice(0, 6);
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3 backdrop-blur">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
        Patch notes
      </div>
      <ul className="space-y-1.5">
        {latest.map((n) => (
          <li key={n.id} className="flex gap-2 text-xs text-zinc-300">
            <span className="shrink-0 font-mono text-[10px] text-zinc-500">
              {new Date(n.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span>{n.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
