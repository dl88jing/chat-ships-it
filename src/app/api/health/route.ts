import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "chat-ships-it",
    demoMode: process.env.DEMO_MODE !== "false",
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
    hasTwitch: Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET),
    time: new Date().toISOString(),
  });
}
