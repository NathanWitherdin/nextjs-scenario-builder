// app/api/scenarios/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/scenarios/[id]
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: { messages: { orderBy: { order: "asc" } } },
    });

    if (!scenario) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Reconstruct per-critical outcome fields for client consumption
    const formatted = {
      ...scenario,
      messages: scenario.messages.map((m) => ({
        ...m,
        courtOutcome:
          m.courtOutcome ??
          (m.category === "critical"
            ? {
                punishment: m.punishment ?? "",
                reason: m.reason ?? "",
                canReturn:
                  typeof m.canReturn === "boolean" ? m.canReturn : true,
                backgroundUrl: m.courtBgUrl ?? "",
              }
            : null),
      })),
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET /api/scenarios/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/scenarios/[id] (replace scenario + messages)
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

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

    const updated = await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { scenarioId: id } });

      const scenario = await tx.scenario.update({
        where: { id },
        data: {
          timerMinutes: body.timerMinutes,
          backgroundUrl: body.backgroundUrl,
          punishmentText: body.punishmentText,
          rules:
            typeof body.rules === "undefined"
              ? {}
              : (body.rules as Prisma.InputJsonValue),

          messages: {
            create: body.messages.map((m: any, i: number) => {
              const co = (m.courtOutcome ?? null) as {
                punishment?: string;
                reason?: string;
                canReturn?: boolean;
                backgroundUrl?: string;
              } | null;

              return {
                category: m.category,
                text: m.text,
                order: Number.isInteger(m.order) ? m.order : i + 1,
                severity: m.severity ?? undefined,
                answer: m.answer ?? undefined,

                // NEW: store per-critical outcome fields
                punishment: co?.punishment ?? null,
                reason: co?.reason ?? null,
                canReturn:
                  typeof co?.canReturn === "boolean" ? co.canReturn : null,
                courtBgUrl: co?.backgroundUrl ?? null,

                // Preserve full JSON for compatibility
                courtOutcome:
                  m.courtOutcome === null ||
                  typeof m.courtOutcome === "undefined"
                    ? Prisma.DbNull
                    : (m.courtOutcome as Prisma.InputJsonValue),
              };
            }),
          },
        },
        include: { messages: { orderBy: { order: "asc" } } },
      });

      return scenario;
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/scenarios/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/scenarios/[id]
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    // Delete messages first (clean cascade)
    await prisma.message.deleteMany({ where: { scenarioId: id } });
    await prisma.scenario.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/scenarios/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
