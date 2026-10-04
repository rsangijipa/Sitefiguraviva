import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/auth/request-origin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("admin_session_backup");
  return NextResponse.json({ status: "success" });
}
