import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  // Real token exchange would go here with TWITCH_CLIENT_SECRET (server-side only).
  // For the hackathon demo we accept the code presence and set a session cookie.
  const code = url.searchParams.get("code");
  const res = NextResponse.redirect(new URL("/dashboard?auth=ok", url.origin));
  res.cookies.set(
    "csi_session",
    JSON.stringify({ user: "northbridge", demo: !code, connected: Boolean(code) }),
    { httpOnly: true, sameSite: "lax", path: "/" },
  );
  return res;
}
