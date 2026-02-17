
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ tier: "free" });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true }
    });

    return NextResponse.json({ tier: user?.tier || "free" });
}
