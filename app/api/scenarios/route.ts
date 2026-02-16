// app/api/scenarios/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

type IncomingMessage = {
  category: string;
  text: string;
  severity?: string | null;
  answer?: string | null;
  courtOutcome?: unknown | null; // { punishment, reason, canReturn, backgroundUrl } | null
  order?: number; // optional in UI; we will auto-assign
};

type IncomingBody = {
  timerMinutes: number;
  backgroundUrl: string;
  punishmentText: string;
  rules?: unknown; // JSON blob
  messages: IncomingMessage[]; // pool (unordered)
};

// POST /api/scenarios  ->  { id }
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;

    // Basic validation
    if (
      typeof body?.timerMinutes !== "number" ||
      !Number.isInteger(body.timerMinutes) ||
      body.timerMinutes <= 0
    ) {
      return NextResponse.json(
        { error: "timerMinutes must be a positive integer" },
        { status: 400 }
      );
    }
    if (!body?.backgroundUrl || typeof body.backgroundUrl !== "string") {
      return NextResponse.json(
        { error: "backgroundUrl is required" },
        { status: 400 }
      );
    }
    if (!body?.punishmentText || typeof body.punishmentText !== "string") {
      return NextResponse.json(
        { error: "punishmentText is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body?.messages)) {
      return NextResponse.json(
        { error: "messages must be an array" },
        { status: 400 }
      );
    }
    for (const m of body.messages) {
      if (!m || typeof m.category !== "string" || typeof m.text !== "string") {
        return NextResponse.json(
          { error: "each message requires category and text" },
          { status: 400 }
        );
      }
    }

    const created = await prisma.scenario.create({
      data: {
        timerMinutes: body.timerMinutes,
        backgroundUrl: body.backgroundUrl,
        punishmentText: body.punishmentText,
        rules:
          typeof body.rules === "undefined"
            ? {}
            : (body.rules as Prisma.InputJsonValue),

        messages: {
          create: body.messages.map((m, i) => {
            // Safely normalize per-critical outcome fields (if provided)
            const co = (m.courtOutcome ?? null) as {
              punishment?: string;
              reason?: string;
              canReturn?: boolean;
              backgroundUrl?: string;
            } | null;

            return {
              category: m.category,
              text: m.text,
              // Auto-assign order if not provided
              order: Number.isInteger(m.order) ? (m.order as number) : i + 1,
              severity: m.severity ?? undefined,
              answer: m.answer ?? undefined,

              // NEW: persist per-critical outcome fields on the Message row
              punishment: co?.punishment ?? null,
              reason: co?.reason ?? null,
              canReturn:
                typeof co?.canReturn === "boolean" ? co.canReturn : null,
              courtBgUrl: co?.backgroundUrl ?? null,

              // Keep full JSON for generator parity / future-proofing
              courtOutcome:
                m.courtOutcome === null || typeof m.courtOutcome === "undefined"
                  ? Prisma.DbNull
                  : (m.courtOutcome as Prisma.InputJsonValue),
            };
          }),
        },
      },
      select: { id: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/scenarios error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// (Optional) GET /api/scenarios?limit=10  -> list latest N
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") ?? 10);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 50)
        : 10;

    const items = await prisma.scenario.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        timerMinutes: true,
        backgroundUrl: true,
        punishmentText: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/scenarios error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
