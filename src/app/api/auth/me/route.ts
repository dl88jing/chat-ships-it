import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const raw = jar.get("csi_session")?.value;
  if (!raw) {
    return NextResponse.json({
      authenticated: false,
      demoMode: process.env.DEMO_MODE !== "false",
    });
  }
  try {
    const session = JSON.parse(raw);
    return NextResponse.json({ authenticated: true, ...session });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
