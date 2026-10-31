"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { CodexBuildPanel } from "@/components/CodexBuildPanel";
import { PatchNotes } from "@/components/PatchNotes";
import { WidgetHost } from "@/components/WidgetHost";
import { useChannel } from "@/components/useChannel";

export default function OverlayPage() {
  const params = useParams<{ channel: string }>();
  const state = useChannel();
  const building = useMemo(
    () =>
      state.queue.find((q) => q.id === state.buildingId) ??
      state.queue.find((q) => q.status === "building" || q.status === "testing") ??
      null,
    [state],
  );
  const latest = state.widgets.filter((w) => w.active).slice(-1)[0];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-transparent text-white">
      <div className="pointer-events-none absolute inset-0">
        <WidgetHost widgets={state.widgets} />
      </div>

      <div className="absolute left-6 top-6 w-[380px]">
        <CodexBuildPanel request={building} />
      </div>

      <div className="absolute bottom-6 left-6 w-[420px]">
        <PatchNotes notes={state.patchNotes} />
      </div>

      <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur">
        overlay / {params.channel}
        {state.demoMode ? " · DEMO_MODE" : ""}
      </div>

      {latest ? (
        <div className="absolute bottom-6 right-6 rounded-full bg-violet-600/90 px-4 py-2 text-sm font-semibold shadow-lg">
          Feature by @{latest.credit} · {latest.name}
        </div>
      ) : null}
    </div>
  );
}
