
const TELEGRAM_API_URL = "https://api.telegram.org/bot";

export async function sendTelegramMessage(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.warn("⚠️ TELEGRAM_BOT_TOKEN is missing. Skipping notification.");
        return;
    }

    try {
        const response = await fetch(`${TELEGRAM_API_URL}${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`❌ Telegram Error: ${err}`);
        }
    } catch (error) {
        console.error("❌ Failed to send Telegram message:", error);
    }
}
