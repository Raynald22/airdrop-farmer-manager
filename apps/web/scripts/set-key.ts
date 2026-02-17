
import { PrismaClient } from "@prisma/client";
import { encrypt } from "../lib/encryption";

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const walletAddress = args[1];
    let privateKey = args[2];

    // Check for "unquoted" mnemonic input (when args > 4)
    if (process.argv.length > 5) {
        console.error("❌ ERROR: It looks like you pasted a SEED PHRASE (multiple words).");
        console.error("   We need the PRIVATE KEY (starts with '0x' and has no spaces).");
        process.exit(1);
    }

    if (!email || !walletAddress || !privateKey) {
        console.error("Usage: npx tsx scripts/set-key.ts <email> <wallet_address> <private_key>");
        process.exit(1);
    }

    // Auto-fix: Add 0x if missing (for 64-char hex strings)
    if (!privateKey.startsWith("0x") && privateKey.length === 64) {
        console.log("⚠️  Note: Added missing '0x' prefix to private key.");
        privateKey = "0x" + privateKey;
    }

    // Strict hex check
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) { // 64 chars + 0x
        console.error("❌ ERROR: Invalid Private Key format.");
        console.error("   - Must start with '0x'");
        console.error("   - Must be 66 characters long (yours is " + privateKey.length + ")");
        process.exit(1);
    }

    // 1. Verify User is authorized (Whale tier & specific email)
    if (email !== "inyourd7@gmail.com") {
        console.error("❌ Access Denied: This feature is restricted to inyourd7@gmail.com");
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.tier !== "whale") {
        console.error("❌ Access Denied: User is not in 'whale' tier.");
        process.exit(1);
    }

    // 2. Find Wallet
    const wallet = await prisma.wallet.findFirst({
        where: {
            address: walletAddress,
            userId: user.id
        }
    });

    if (!wallet) {
        console.error(`❌ Wallet ${walletAddress} not found for this user.`);
        process.exit(1);
    }

    // 3. Encrypt & Save
    const encryptedKey = encrypt(privateKey);

    await prisma.wallet.update({
        where: { id: wallet.id },
        data: { encryptedPrivateKey: encryptedKey }
    });

    console.log(`✅ Private Key for ${walletAddress} has been encrypted and saved.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
