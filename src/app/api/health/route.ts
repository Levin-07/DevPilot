import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    // Execute a fast ping query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: message,
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        hint: "Verify that PostgreSQL is running and credentials in .env are accurate.",
      },
      { status: 503 }
    );
  }
}
