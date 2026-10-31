"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CodexBuildPanel } from "@/components/CodexBuildPanel";
import { QueuePanel } from "@/components/QueuePanel";
import { PatchNotes } from "@/components/PatchNotes";
import { ChatPanel } from "@/components/ChatPanel";
import { WidgetHost } from "@/components/WidgetHost";
import { useChannel } from "@/components/useChannel";
import {
  approveAndBuild,
  redeemFeature,
  revertWidget,
  pushChat,
  pushCheer,
  pushRaid,
  remixTopTwo,
  runDemoScript,
} from "@/lib/demo-store";

export default function DemoPage() {
  const state = useChannel();
  const [chatInput, setChatInput] = useState("LUL");
  const busy = Boolean(state.buildingId);
  const building = useMemo(
    () =>
      state.queue.find((q) => q.id === state.buildingId) ??
      state.queue.find((q) => q.status === "building" || q.status === "testing") ??
      null,
    [state],
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-white/10 px-4 py-3">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">
              ← Chat Ships It
            </Link>
            <h1 className="text-lg font-bold">Interactive stream demo</h1>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
              DEMO_MODE
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runDemoScript()}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
            >
              ▶ Autoplay demo
            </button>
            <button
              onClick={() => {
                redeemFeature("Morgan", "add a rubber duck that quacks every time someone says LUL");
              }}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              Redeem duck
            </button>
            <button
              onClick={() => redeemFeature("Avery", "confetti burst whenever we get raided or cheered")}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              Redeem confetti
            </button>
            <button
              onClick={() => void remixTopTwo()}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              !remix
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 p-4 lg:grid-cols-[1fr_320px]">
        {/* Simulated stream canvas */}
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-2xl">
            {/* Fake gameplay / cam backdrop */}
            <div className="absolute inset-0 opacity-40" style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(145,70,255,.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(16,185,129,.2), transparent 35%), linear-gradient(135deg,#18181b,#09090b)",
            }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-sm uppercase tracking-[0.3em] text-zinc-500">Simulated stream</div>
              <div className="mt-2 text-3xl font-black text-white/90">Northbridge Live</div>
              <div className="mt-1 text-sm text-zinc-400">OBS browser source → /overlay/northbridge</div>
            </div>

            <WidgetHost widgets={state.widgets} />

            <div className="absolute left-4 top-4 w-[340px]">
              <CodexBuildPanel request={building} />
            </div>

            <div className="absolute bottom-4 left-4 w-[380px]">
              <PatchNotes notes={state.patchNotes} />
            </div>

            {state.widgets.filter((w) => w.active).slice(-1).map((w) => (
              <div
                key={w.id}
                className="absolute bottom-4 right-4 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold shadow-lg"
              >
                Feature by @{w.credit} · {w.name}
              </div>
            ))}

            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <QueuePanel
              queue={state.queue}
              busy={busy}
              onShip={(id) => void approveAndBuild(id)}
              onRevert={(wid) => revertWidget(wid)}
            />
            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-4">
              <h3 className="text-sm font-semibold">Active widgets</h3>
              <ul className="mt-3 space-y-2">
                {state.widgets.filter((w) => w.active).length === 0 && (
                  <li className="text-sm text-zinc-500">None shipped yet — approve a queue item.</li>
                )}
                {state.widgets
                  .filter((w) => w.active)
                  .map((w) => (
                    <li key={w.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-sm">
                      <span>
                        {w.name} <span className="text-zinc-500">by @{w.credit}</span>
                      </span>
                      <button
                        onClick={() => revertWidget(w.id)}
                        className="text-xs text-orange-300 hover:underline"
                      >
                        !revert
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="h-[520px]">
            <ChatPanel messages={state.chat} />
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatInput.trim()) return;
              pushChat("You", chatInput.trim(), "#9146FF");
              setChatInput("");
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              placeholder="Send chat (try LUL)"
            />
            <button className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-semibold">Send</button>
          </form>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => pushCheer("River", 100)} className="rounded-lg border border-white/10 px-2 py-1 text-xs">
              Cheer
            </button>
            <button onClick={() => pushRaid("Avery", 28)} className="rounded-lg border border-white/10 px-2 py-1 text-xs">
              Raid
            </button>
            <button onClick={() => pushChat("Morgan", "HYPE", "#EB459E")} className="rounded-lg border border-white/10 px-2 py-1 text-xs">
              HYPE
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-400">
            This page is the judge-friendly path: mock Twitch EventSub + pre-built Codex widget templates
            with a live “Codex is building…” panel. With <code className="text-emerald-300">OPENAI_API_KEY</code>{" "}
            set, <code>/api/build</code> can generate fresh widget HTML server-side.
          </div>
        </aside>
      </main>
    </div>
  );
}
