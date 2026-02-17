
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const tier = args[1];

    if (!email || !tier) {
        console.error("Usage: npx tsx prisma/admin.ts <email> <tier>");
        console.error("Example: npx tsx prisma/admin.ts user@example.com whale");
        process.exit(1);
    }

    console.log(`Looking for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`Current tier: ${user.tier}`);
    console.log(`Updating to tier: ${tier}...`);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: { tier },
    });

    console.log(`✅ Success! User ${updatedUser.email} is now ${updatedUser.tier}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
