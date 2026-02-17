import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripeSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
        return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    try {
        const session = await getStripeSession(
            priceId,
            user.id,
            user.emailAddresses[0].emailAddress
        );

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
