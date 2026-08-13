import { NextResponse } from "next/server";
import { writeScreens } from "@/lib/config/screens.server";
import type { ScreensConfig } from "@/lib/geometry/types";

export async function POST(request: Request) {
  const body = (await request.json()) as ScreensConfig;
  writeScreens(body);
  return NextResponse.json({ ok: true });
}
