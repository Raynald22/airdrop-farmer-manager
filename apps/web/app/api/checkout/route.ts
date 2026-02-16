import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripeSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
        return new NextResponse("Price ID is required", { status: 400 });
    }

    try {
        const session = await getStripeSession(
            priceId,
            user.id,
            user.emailAddresses[0].emailAddress
        );

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
