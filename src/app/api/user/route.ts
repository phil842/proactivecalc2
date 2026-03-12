import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** POST /api/user – create or return existing user */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; interests?: string[] };
    const interests = body.interests ?? [];
    const user = await prisma.user.create({
      data: {
        name: body.name ?? null,
        interests: JSON.stringify(interests),
        preferences: JSON.stringify({ minBlock: 10, maxBlock: 60 }),
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("POST /api/user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

/** GET /api/user?id=xxx */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH /api/user – update interests / preferences */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { id: string; interests?: string[]; preferences?: Record<string, unknown> };
    const { id, interests, preferences } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updateData: Record<string, string> = {};
    if (interests !== undefined) updateData.interests = JSON.stringify(interests);
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences);

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("PATCH /api/user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
