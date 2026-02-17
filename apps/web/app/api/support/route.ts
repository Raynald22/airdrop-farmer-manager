
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { rateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";

// Hardcode Admin Chat ID for now, or use another ENV
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(req: Request) {
    const { userId } = await auth();
    const user = await currentUser();
    const ip = (await headers()).get("x-forwarded-for") || "unknown";

    try {
        await rateLimiter.consume(ip);
    } catch {
        return new NextResponse("Too Many Requests", { status: 429 });
    }

    try {
        const { message } = await req.json();

        if (!message) {
            return new NextResponse("Message required", { status: 400 });
        }

        if (ADMIN_CHAT_ID) {
            const userEmail = user?.emailAddresses[0]?.emailAddress || "Guest";
            const text = `🔔 *New Support Request*\n\n👤 *User:* ${userEmail}\n📝 *Message:* ${message}`;
            await sendTelegramMessage(ADMIN_CHAT_ID, text);
        } else {
            console.warn("TELEGRAM_ADMIN_CHAT_ID not set");
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[SUPPORT_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
