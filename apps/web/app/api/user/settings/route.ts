
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { rateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const { userId } = await auth();
    const ip = (await headers()).get("x-forwarded-for") || "unknown";

    try {
        await rateLimiter.consume(ip);
    } catch {
        return new NextResponse("Too Many Requests", { status: 429 });
    }

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { telegramChatId, action } = body;

        if (action === "save") {
            await prisma.user.update({
                where: { id: userId },
                data: { telegramChatId },
            });
            return NextResponse.json({ success: true, message: "Settings saved" });
        }

        if (action === "test") {
            if (!telegramChatId) {
                return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
            }

            await sendTelegramMessage(telegramChatId, "🔔 *Test Notification*\n\nThis is a test message from your Airdrop Farmer Manager. If you see this, integration is working! 🚀");

            return NextResponse.json({ success: true, message: "Test message sent" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("[SETTINGS_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
