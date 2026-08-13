import { NextResponse } from "next/server";
import { writeScreens } from "@/lib/config/screens.server";
import type { ScreensConfig } from "@/lib/geometry/types";

// Matches data/screens.json, data/screens2.json, data/screens3.json, etc.
// Rejected outright otherwise — this becomes a filesystem path, so it must
// never pass through anything from the request beyond this shape.
const VALID_VIEW = /^screens\d*$/;

export async function POST(request: Request, { params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VALID_VIEW.test(view)) {
    return NextResponse.json({ ok: false, error: "invalid view" }, { status: 400 });
  }
  const body = (await request.json()) as ScreensConfig;
  writeScreens(view, body);
  return NextResponse.json({ ok: true });
}
