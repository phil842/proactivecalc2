import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSuggestions } from "@/lib/suggestions";
import { buildContext } from "@/lib/context";

/** GET /api/suggestions?userId=xxx – return current pending suggestions */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const activities = await prisma.activityInstance.findMany({
      where: { userId, status: "pending" },
      orderBy: { suggestedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ activities });
  } catch (err) {
    console.error("GET /api/suggestions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST /api/suggestions – generate a fresh suggestion feed */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string;
      minutesUntilNextEvent?: number | null;
      location?: string;
    };

    const { userId, minutesUntilNextEvent = null } = body;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Build context (server-side time)
    const context = buildContext(new Date(), minutesUntilNextEvent ?? null);

    const ids = await generateSuggestions(userId, context);

    const activities = await prisma.activityInstance.findMany({
      where: { id: { in: ids } },
      orderBy: { suggestedAt: "desc" },
    });

    return NextResponse.json({ activities, context });
  } catch (err) {
    console.error("POST /api/suggestions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
