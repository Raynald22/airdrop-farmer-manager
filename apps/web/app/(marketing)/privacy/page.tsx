
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Airdrop Farmer Manager",
  description: "Privacy Policy for Airdrop Farmer Manager",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Introduction</h2>
        <p className="loading-relaxed">
          Welcome to Airdrop Farmer Manager ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data:</strong> includes email address.</li>
          <li><strong>Wallet Data:</strong> includes public blockchain addresses you choose to track.</li>
          <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
        </ul>
        <div className="bg-muted/50 p-4 rounded-lg mt-4 border-l-4 border-primary">
          <p className="text-sm">
            <strong>Important:</strong> We do NOT store your private keys unless you explicitly use the "Auto-Farming" feature, in which case they are encrypted using AES-256 military-grade encryption and stored securely. You can delete them at any time.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>To provide the airdrop tracking services you have requested.</li>
          <li>To manage your subscription and payments (via Stripe).</li>
          <li>To send you notifications about your farming tasks (via Telegram, if enabled).</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact us at support@airdropfarmer.com.
        </p>
      </section>
    </div>
  );
}
