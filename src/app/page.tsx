import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 15% -10%, rgba(145,70,255,.28), transparent 55%), radial-gradient(700px 480px at 90% 10%, rgba(16,185,129,.16), transparent 50%), #09090b",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-24 pt-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-sm font-black text-white">
              CS
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Chat Ships It</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Green Robin Labs · Northbridge
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/demo" className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Live demo
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-white/5">
              Dashboard
            </Link>
            <a
              href="https://github.com/dl88jing/chat-ships-it"
              className="rounded-lg border border-white/15 px-3 py-1.5 font-medium text-white hover:bg-white/5"
            >
              GitHub
            </a>
          </nav>
        </header>

        <section className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Codex x TwitchCon Hackathon
            </div>
            <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              Chat ships it.
              <span className="block bg-gradient-to-r from-violet-300 to-emerald-300 bg-clip-text text-transparent">
                Codex builds it live.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">
              Viewers redeem a <strong className="text-zinc-200">Ship a Feature</strong> channel-point
              reward. Mods approve with <code className="text-emerald-300">!ship</code>. A sandboxed
              Codex worker writes an overlay widget on stream — plan, diff, tests, then hot-load —
              credited to the viewer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(145,70,255,.35)] hover:bg-violet-400"
              >
                Open interactive demo
              </Link>
              <Link
                href="/overlay/northbridge"
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/5"
              >
                OBS overlay
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Demo runs in <code>DEMO_MODE</code> with mock Twitch auth. No Twitch Client ID required to
              try the full loop.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(145,70,255,.2),transparent_50%)]" />
            <div className="absolute left-4 right-4 top-4 rounded-xl border border-emerald-500/30 bg-zinc-900/90 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Codex is building…
              </div>
              <div className="mt-1 text-sm text-zinc-200">rubber duck that quacks on LUL · @Morgan</div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-zinc-400">
                <div className="text-emerald-400">✓ Parse request → overlay widget</div>
                <div className="text-amber-300">› Scaffold onChat + quack animation</div>
                <div className="text-zinc-600">· Validate sandbox size</div>
              </div>
              <pre className="mt-2 rounded bg-black/50 p-2 font-mono text-[10px] text-emerald-400">
                {`+ api.onChat(m => /\\bLUL\\b/i.test(m.text) && quack())`}
              </pre>
            </div>
            <div className="absolute bottom-6 right-8 text-7xl drop-shadow-xl">🦆</div>
            <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-xs text-zinc-200">
              Feature by @Morgan
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Codex is the mechanic",
              d: "Judges watch Codex plan, diff, and ship on the overlay — not just in a build log.",
            },
            {
              t: "Sandboxed by design",
              d: "Widgets run in iframe sandbox=allow-scripts with a CSP that blocks network, a size budget, and mod approval.",
            },
            {
              t: "Built for stream",
              d: "OBS overlay, mod dashboard, patch-notes ticker, !ship / !revert / !remix — ready for a real channel.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="text-base font-semibold text-white">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-emerald-500/5 p-8">
          <h2 className="text-2xl font-bold text-white">How it works</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              "Viewer redeems Ship a Feature with a one-line ask",
              "Mod approves with !ship N",
              "Codex SDK writes a widget against the overlay API",
              "Widget hot-loads into OBS · credited to chat",
            ].map((step, i) => (
              <li key={step} className="rounded-xl border border-white/10 bg-zinc-950/50 p-4">
                <div className="text-xs font-bold text-violet-300">0{i + 1}</div>
                <div className="mt-2 text-sm text-zinc-200">{step}</div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500">
          <div>
            Chat Ships It · Green Robin Labs · Codex x TwitchCon 2026 · MIT
          </div>
          <div className="flex gap-4">
            <a className="hover:text-zinc-300" href="https://github.com/dl88jing/chat-ships-it">
              Repo
            </a>
            <Link className="hover:text-zinc-300" href="/demo">
              Demo
            </Link>
            <a className="hover:text-zinc-300" href="/docs/CODEX.md">
              How we used Codex
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
