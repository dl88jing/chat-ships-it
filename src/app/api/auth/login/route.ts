import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Mock Twitch OAuth login when DEMO_MODE is on or Twitch creds missing. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const demo = process.env.DEMO_MODE !== "false" || !process.env.TWITCH_CLIENT_ID;
  if (demo) {
    const res = NextResponse.redirect(new URL("/dashboard?auth=demo", url.origin));
    res.cookies.set("csi_session", JSON.stringify({ user: "northbridge", demo: true }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  }
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const redirectUri = process.env.TWITCH_REDIRECT_URI || `${url.origin}/api/auth/callback`;
  const scopes = [
    "user:read:chat",
    "user:write:chat",
    "user:bot",
    "channel:bot",
    "channel:read:redemptions",
    "channel:manage:redemptions",
  ].join(" ");
  const auth = new URL("https://id.twitch.tv/oauth2/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", scopes);
  return NextResponse.redirect(auth.toString());
}
