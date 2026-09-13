import { NextResponse } from "next/server";

/** @deprecated Sensitive assessment uploads must use /api/assessment-files. */
export async function POST() {
  return NextResponse.json(
    { error: "Use /api/assessment-files for authorized private uploads." },
    { status: 410 },
  );
}
