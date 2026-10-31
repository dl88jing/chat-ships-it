"use client";

import Link from "next/link";
import { useState } from "react";
import { CodexBuildPanel } from "@/components/CodexBuildPanel";
import { QueuePanel } from "@/components/QueuePanel";
import { PatchNotes } from "@/components/PatchNotes";
import { ChatPanel } from "@/components/ChatPanel";
import { useChannel } from "@/components/useChannel";
import {
  approveAndBuild,
  redeemFeature,
  revertWidget,
  pushChat,
  pushCheer,
  pushRaid,
  runDemoScript,
} from "@/lib/demo-store";

export default function DashboardPage() {
  const state = useChannel();
  const [prompt, setPrompt] = useState("add a rubber duck that quacks every time someone says LUL");
  const [viewer, setViewer] = useState("Morgan");
  const busy = Boolean(state.buildingId);
  const building = state.queue.find((q) => q.id === state.buildingId) ?? null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Streamer dashboard</div>
            <h1 className="text-xl font-bold">#{state.channel} · Chat Ships It</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
              DEMO_MODE · mock Twitch auth
            </span>
            <Link href="/demo" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5">
              Full demo
            </Link>
            <Link href="/overlay/northbridge" className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold hover:bg-violet-400">
              Open overlay
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
            <h2 className="text-sm font-semibold">Simulate redemption</h2>
            <p className="mt-1 text-xs text-zinc-500">
              In production this comes from EventSub <code>channel.channel_points_custom_reward_redemption.add</code>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={viewer}
                onChange={(e) => setViewer(e.target.value)}
                className="w-36 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="viewer"
              />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-w-[280px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="one-line feature request"
              />
              <button
                onClick={() => redeemFeature(viewer || "viewer", prompt || "a fun overlay widget")}
                className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-400"
              >
                Redeem
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => pushChat("Morgan", "LUL", "#EB459E")} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                Chat: LUL
              </button>
              <button onClick={() => pushChat("Avery", "Kappa Kappa", "#57F287")} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                Chat: Kappa
              </button>
              <button onClick={() => pushCheer("River", 100)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                Cheer 100
              </button>
              <button onClick={() => pushRaid("Morgan", 42)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                Raid 42
              </button>
              <button onClick={() => runDemoScript()} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20">
                Run demo script
              </button>
            </div>
          </div>

          <QueuePanel
            queue={state.queue}
            busy={busy}
            onShip={(id) => void approveAndBuild(id)}
            onRevert={(wid) => revertWidget(wid)}
          />

          <CodexBuildPanel request={building} />
        </div>

        <aside className="space-y-4">
          <div className="h-[420px]">
            <ChatPanel messages={state.chat} />
          </div>
          <PatchNotes notes={state.patchNotes} />
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-xs text-zinc-400">
            <div className="font-semibold text-zinc-200">Connect real Twitch</div>
            <p className="mt-2 leading-relaxed">
              Set <code className="text-emerald-300">TWITCH_CLIENT_ID</code>,{" "}
              <code className="text-emerald-300">TWITCH_CLIENT_SECRET</code>, and{" "}
              <code className="text-emerald-300">DEMO_MODE=false</code>. Register the OAuth redirect at{" "}
              <code>/api/auth/callback</code>. Until then, this dashboard uses mock auth so judges can
              click through the full loop without a Twitch app review.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
