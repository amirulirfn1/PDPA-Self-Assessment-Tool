import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "auditless-app",
    timestamp: new Date().toISOString(),
  });
}
