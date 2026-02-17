
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type AlertType = "inactivity" | "low_balance" | "opportunity" | "task_completed" | "info";
export type AlertPriority = "info" | "warning" | "critical" | "success";

export async function createAlert(
    userId: string,
    type: AlertType,
    priority: AlertPriority,
    title: string,
    message: string,
    data?: any // For storing extra like walletAddress or chainId if schema allows (currently schema is simple)
) {
    try {
        await prisma.alert.create({
            data: {
                userId,
                type,
                priority,
                title,
                message,
                read: false,
            },
        });
    } catch (error) {
        console.error("Failed to create alert:", error);
    }
}
