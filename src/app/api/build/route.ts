import { NextResponse } from "next/server";
import { buildWidget } from "@/lib/build-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    viewer?: string;
  };
  const prompt = (body.prompt || "").slice(0, 240).trim();
  const viewer = (body.viewer || "viewer").replace(/[^\w]/g, "").slice(0, 25) || "viewer";
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }
  const result = await buildWidget(prompt, viewer);
  return NextResponse.json(result);
}
