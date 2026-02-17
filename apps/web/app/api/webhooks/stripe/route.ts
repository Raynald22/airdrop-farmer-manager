
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("Stripe-Signature") as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (error: any) {
            return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
        }

        const session = event.data.object as Stripe.Checkout.Session;

        if (event.type === "checkout.session.completed") {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            if (!session?.metadata?.userId) {
                return new NextResponse("User id is required", { status: 400 });
            }

            // Map Price ID to Tier
            // Default to 'pro' if unknown, but check specific IDs
            const priceId = subscription.items.data[0].price.id;
            let tier = "pro"; // Default fallback

            if (priceId === "price_1T1sYzDuwsWR5LkOoqKiEJ4y") {
                tier = "whale";
            } else if (priceId === "price_1T1sYDDuwsWR5LkOUwmX3c79") {
                tier = "pro";
            }

            await prisma.user.update({
                where: {
                    id: session.metadata.userId,
                },
                data: {
                    stripeCustomerId: subscription.customer as string,
                    subscriptionId: subscription.id,
                    subscriptionStatus: subscription.status,
                    currentPeriodEnd: new Date(
                        (subscription as any).current_period_end * 1000
                    ),
                    tier: tier,
                },
            });
        }

        if (event.type === "invoice.payment_succeeded") {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            await prisma.user.update({
                where: {
                    stripeCustomerId: subscription.customer as string,
                },
                data: {
                    currentPeriodEnd: new Date(
                        (subscription as any).current_period_end * 1000
                    ),
                    subscriptionStatus: subscription.status,
                },
            });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[STRIPE_WEBHOOK]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
