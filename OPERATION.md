# WarmUpHero - Operation Guide

## 1. Overview
WarmUpHero is a Peer-to-Peer (P2P) email warmup tool designed to improve your domain reputation. It works by connecting multiple email accounts that send emails to each other, automatically rescue them from spam folders, mark them as "Important," and reply to them.

## 2. Prerequisites
To use WarmUpHero effective, you need:
*   **At least 2 Email Accounts:** The system is P2P. Account A sends to Account B, and Account B sends to Account A. You cannot warm up a single account in isolation.
*   **App Passwords (for Gmail/Outlook):**
    *   **Gmail:** You MUST use an **App Password**, not your regular login password. Go to [Google Account > Security > 2-Step Verification > App Passwords](https://myaccount.google.com/apppasswords).
    *   **Outlook/Other:** Ensure SMTP/IMAP access is enabled in settings.

## 3. Getting Started
1.  **Access the Dashboard:** Open the application (locally at `http://localhost:3000` or your deployed URL).
2.  **Connect Account 1:**
    *   Enter Name, Email, and App Password.
    *   The system will auto-detect settings for Gmail, Outlook, iCloud, etc.
    *   Click **Connect & Test**. Green success message = Ready.
3.  **Connect Account 2:**
    *   Repeat the process for a second email account.
    *   *Tip:* Using different providers (e.g., one Gmail, one Outlook) creates a more realistic network.

## 4. The Warmup Process
Once you have 2+ active accounts, the engine can run.

### Manual Mode (Testing/Dev)
Use the **"Engine Controls"** card on the dashboard:
1.  **Trigger Send Run:** Forces every active account to send 1 AI-generated email to a random peer.
2.  **Trigger Inbox Check:** Forces every active account to:
    *   Scan Spam/Junk folders.
    *   Find emails with the `X-Warmup-Hero` header.
    *   **Rescue:** Move them to Inbox + Mark as Read + Star them (High positive signal).
    *   **Reply:** Send a natural, AI-generated reply back to the sender.

### Automatic Mode (Production)
When deployed to Vercel (or using a Cron scheduler):
*   **Sending:** Runs automatically every **30 minutes**.
*   **Checking/Rescuing:** Runs automatically every **30 minutes** (15 minutes offset from sending).
*   *Note:* No manual intervention is required.

## 5. Dashboard Metrics
*   **Health Score (0-100%):** A real-time gauge of your reputation.
    *   *Calculation:* `100 - (Spam Rate %)`.
    *   *Example:* If 10 emails are sent and 1 lands in Spam, your score is 90%.
*   **Daily Volume:** Number of warmup emails sent today vs. your daily limit (default: 50).
*   **Rescue Count:** Total number of emails successfully saved from the spam folder. This is the most important metric for improving reputation.

## 6. Troubleshooting
*   **"Invalid email or password":**
    *   Gmail users: Did you use an **App Password**?
    *   Outlook users: Did you enable "Let devices and apps use POP/IMAP"?
*   **"Mock Data" on Dashboard:**
    *   The dashboard shows mock data until you have sent at least 1 real warmup email. Use "Trigger Send Run" to kickstart it.
*   **System not sending?**
    *   Ensure you have at least 2 accounts with status `active` in the database.

## 7. Monetization & Billing
WarmUpHero includes a tiered subscription system powered by Stripe.

### Pricing Plans
1.  **Free:** 1 Account, 5 emails/day.
2.  **Starter ($29/mo):** 3 Accounts, 50 emails/day.
3.  **Agency ($99/mo):** Unlimited Accounts, 200 emails/day.

### Setup (Developer)
1.  **Env Variables:** Ensure `.env.local` contains your Stripe keys:
    ```bash
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    STRIPE_PRICE_ID_STARTER=price_...
    STRIPE_PRICE_ID_AGENCY=price_...
    NEXT_PUBLIC_BASE_URL=http://localhost:3000 # or your production URL
    ```
2.  **Webhooks:**
    *   **Local:** Use Stripe CLI to forward events: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
    *   **Production:** Add your production URL `https://your-domain.com/api/stripe/webhook` to the Stripe Dashboard > Developers > Webhooks.

