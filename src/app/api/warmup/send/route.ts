import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/utils/encryption';
import { generateEmailContent } from '@/lib/openai';

export const dynamic = 'force-dynamic'; // No caching

export async function POST(req: Request) {
    return handleSendRequest(req);
}

export async function GET(req: Request) {
    return handleSendRequest(req);
}

async function handleSendRequest(req: Request) {
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

            } catch (err: any) {
                console.error(`Failed to send from ${sender.email_address}:`, err);

                // Log failure
                await supabase.from('email_logs').insert({
                    account_id: sender.id,
                    type: 'SENT',
                    status: 'FAILED',
                    details: { error: err.message }
                });

                // Update status if auth failed (simplified check)
                if (err.responseCode === 535 || err.message?.includes('Invalid login')) {
                    await supabase.from('email_accounts').update({ status: 'ERROR_AUTH' }).eq('id', sender.id);
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
