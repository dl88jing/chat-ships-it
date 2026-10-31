"use client";

import type { FeatureRequest } from "@/lib/types";

export function CodexBuildPanel({ request }: { request: FeatureRequest | null }) {
  if (!request || !["building", "testing", "shipped"].includes(request.status)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4 backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          <span className="inline-block h-2 w-2 rounded-full bg-zinc-600" />
          Codex idle
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Waiting for a mod to <code className="text-emerald-300">!ship</code> a queued feature…
        </p>
      </div>
    );
  }

  const steps = request.steps ?? [];
  const diff = request.diff ?? [];

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-zinc-950/95 p-4 shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Codex is building…
        </div>
        <div className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
          sandbox · workspace-write
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-100">
        {request.prompt}
        <span className="ml-2 text-zinc-500">· @{request.viewer}</span>
      </p>

      <ol className="mt-3 space-y-1.5">
        {steps.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-xs">
            <span
              className={
                s.status === "done"
                  ? "text-emerald-400"
                  : s.status === "running"
                    ? "text-amber-300"
                    : s.status === "fail"
                      ? "text-rose-400"
                      : "text-zinc-600"
              }
            >
              {s.status === "done" ? "✓" : s.status === "running" ? "›" : s.status === "fail" ? "✕" : "·"}
            </span>
            <span className={s.status === "pending" ? "text-zinc-600" : "text-zinc-300"}>
              {s.label}
              {s.detail && s.status === "running" ? (
                <span className="ml-2 font-mono text-[10px] text-zinc-500">{s.detail}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {diff.length > 0 && (
        <pre className="mt-3 max-h-36 overflow-auto rounded-lg bg-black/60 p-3 font-mono text-[11px] leading-relaxed">
          {diff.map((d, i) => (
            <div
              key={i}
              className={
                d.kind === "add" ? "text-emerald-400" : d.kind === "del" ? "text-rose-400" : "text-zinc-500"
              }
            >
              {d.text}
            </div>
          ))}
        </pre>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
            request.testPass
              ? "bg-emerald-500/15 text-emerald-300"
              : request.status === "testing"
                ? "bg-amber-500/15 text-amber-200"
                : "bg-zinc-800 text-zinc-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              request.testPass ? "bg-emerald-400" : request.status === "testing" ? "bg-amber-300" : "bg-zinc-500"
            }`}
          />
          {request.testPass ? "tests passed" : request.status === "testing" ? "running tests…" : "tests pending"}
        </span>
        {request.status === "shipped" && (
          <span className="text-emerald-300">Shipped · Feature by @{request.credit ?? request.viewer}</span>
        )}
      </div>
    </div>
  );
}
