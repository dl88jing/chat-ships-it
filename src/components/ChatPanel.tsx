"use client";

import type { ChatMessage } from "@/lib/types";

export function ChatPanel({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur">
      <div className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
        Live chat · DEMO
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className="text-sm leading-snug">
            <span className="font-semibold" style={{ color: m.color }}>
              {m.user}
            </span>
            <span className="text-zinc-500">: </span>
            <span className="text-zinc-200">{m.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
