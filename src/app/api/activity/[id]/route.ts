import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ActivityAction = "completed" | "skipped" | "later";

/** PATCH /api/activity/[id] – record user action on a suggestion */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as { action: ActivityAction; skippedReason?: string };
    const { action, skippedReason } = body;

    if (!["completed", "skipped", "later"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status: action };
    if (action === "completed") updateData.completedAt = new Date();
    if (action === "skipped" && skippedReason) updateData.skippedReason = skippedReason;

    const activity = await prisma.activityInstance.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ activity });
  } catch (err) {
    console.error(`PATCH /api/activity/[id] error:`, err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
