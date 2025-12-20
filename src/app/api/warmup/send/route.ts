import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/utils/encryption';
import { generateEmailContent } from '@/lib/openai';

export const dynamic = 'force-dynamic'; // No caching

export async function POST() {
    return handleSendRequest();
}

export async function GET() {
    return handleSendRequest();
}

async function handleSendRequest() {
    try {
        // 1. Fetch active accounts
        const { data: accounts, error } = await supabase
            .from('email_accounts')
            .select('*')
            .eq('status', 'active');
        // ... rest of the logic ...

        if (error) throw new Error(error.message);
        if (!accounts || accounts.length < 2) {
            return NextResponse.json({ message: 'Not enough active accounts to warm up.' }, { status: 200 });
        }

        const results = [];

        // 2. Iterate and Send (Simplified: Each account sends 1 email to a random peer)
        for (const sender of accounts) {
            // --- CHECK DAILY LIMIT ---
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: sentToday } = await supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .eq('account_id', sender.id)
                .eq('type', 'SENT')
                .eq('status', 'SUCCESS')
                .gte('timestamp', today.toISOString());

            if ((sentToday || 0) >= sender.daily_limit) {
                results.push({ sender: sender.email_address, status: 'Limit Reached' });
                continue;
            }

            // Select random receiver that is NOT the sender
            const peers = accounts.filter(a => a.id !== sender.id);
            if (peers.length === 0) continue;
            const receiver = peers[Math.floor(Math.random() * peers.length)];

            try {
                const decryptedPassword = decrypt(sender.encrypted_password, sender.iv);

                const transporter = createTransport({
                    host: sender.smtp_host,
                    port: sender.smtp_port,
                    secure: sender.smtp_port === 465,
                    auth: {
                        user: sender.email_address,
                        pass: decryptedPassword,
                    },
                });

                const { subject, body } = await generateEmailContent();

                // The "Secret Header" is injected here
                await transporter.sendMail({
                    from: sender.email_address,
                    to: receiver.email_address,
                    subject: subject,
                    text: body,
                    headers: {
                        'X-Warmup-Hero': 'true'
                    }
                });

                // Log success
                await supabase.from('email_logs').insert({
                    account_id: sender.id,
                    type: 'SENT',
                    status: 'SUCCESS',
                    details: { to: receiver.email_address }
                });

                results.push({ sender: sender.email_address, receiver: receiver.email_address, status: 'sent' });

            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error = err as any;
                console.error(`Failed to send from ${sender.email_address}:`, error);

                // Log failure
                await supabase.from('email_logs').insert({
                    account_id: sender.id,
                    type: 'SENT',
                    status: 'FAILED',
                    details: { error: error.message }
                });

                // Update status if auth failed (simplified check)
                if (error.responseCode === 535 || error.message?.includes('Invalid login')) {
                    await supabase.from('email_accounts').update({ status: 'ERROR_AUTH' }).eq('id', sender.id);
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
