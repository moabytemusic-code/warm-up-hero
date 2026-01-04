import { NextResponse } from 'next/server';
import imaps from 'imap-simple';
import { createTransport } from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/utils/encryption';
import { generateReplyContent } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const SPAM_BOX_NAMES = ['spam', 'junk', 'bulk', 'junk e-mail', 'junk email'];

export async function POST() {
    return handleCheckRequest();
}

export async function GET() {
    return handleCheckRequest();
}

async function handleCheckRequest() {
    const results = [];

    try {
        // 1. Fetch active accounts
        const { data: accounts, error } = await supabase
            .from('email_accounts')
            .select('*')
            .neq('status', 'ERROR_AUTH');

        if (error) throw new Error(error.message);
        if (!accounts || accounts.length === 0) {
            return NextResponse.json({ message: 'No accounts to check.' });
        }

        for (const account of accounts) {
            let connection: imaps.ImapSimple | null = null;
            try {
                const decryptedPassword = decrypt(account.encrypted_password, account.iv);

                const config = {
                    imap: {
                        user: account.email_address,
                        password: decryptedPassword,
                        host: account.imap_host,
                        port: account.imap_port,
                        tls: account.imap_port === 993,
                        authTimeout: 10000,
                        tlsOptions: { rejectUnauthorized: false }
                    }
                };

                connection = await imaps.connect(config);

                // 2. Robust Find Spam Folder
                const boxes = await connection.getBoxes();
                let spamBoxPath: string | null = null;



                // Manual checks for common providers to be safe (overriding generic search)
                if (boxes['[Gmail]'] && boxes['[Gmail]'].children) {
                    if (boxes['[Gmail]'].children['Spam']) spamBoxPath = '[Gmail]/Spam';
                    else if (boxes['[Gmail]'].children['Junk']) spamBoxPath = '[Gmail]/Junk';
                }

                if (!spamBoxPath) {
                    // Fallback to top-level iteration
                    for (const key in boxes) {
                        if (SPAM_BOX_NAMES.includes(key.toLowerCase())) {
                            spamBoxPath = key;
                            break;
                        }
                    }
                }

                if (!spamBoxPath) {
                    results.push({ account: account.email_address, status: 'No Spam Box Found' });
                    connection.end();
                    continue;
                }

                await connection.openBox(spamBoxPath);

                // 3. Search for X-Warmup-Hero
                const searchCriteria = [
                    'UNSEEN',
                    ['HEADER', 'X-Warmup-Hero', 'true']
                ];

                const fetchOptions = {
                    bodies: ['HEADER', 'TEXT'],
                    markSeen: false
                };

                const messages = await connection.search(searchCriteria, fetchOptions);

                if (messages.length > 0) {
                    console.log(`Found ${messages.length} warmup emails in spam for ${account.email_address}`);

                    for (const message of messages) {
                        try {
                            const uid = message.attributes.uid;

                            // 1. Mark as SEEN and FLAGGED (Before moving)
                            await connection.addFlags(uid, ['\\Seen', '\\Flagged']);

                            // 2. Move to INBOX
                            await connection.moveMessage(String(uid), 'INBOX');

                            // 3. Extract Info for Reply
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const headerPart = message.parts.find((p: any) => p.which === 'HEADER');
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const textPart = message.parts.find((p: any) => p.which === 'TEXT');

                            const from = headerPart?.body?.from?.[0]; // "Name <email>"
                            const subject = headerPart?.body?.subject?.[0];
                            const body = textPart?.body || "";

                            // Clean up FROM to get just email
                            const replyToEmail = from?.match(/<(.+)>/)?.[1] || from;

                            // 4. Send Reply (Optional but implemented)
                            if (replyToEmail) {
                                const replyBody = await generateReplyContent(body);

                                const transporter = createTransport({
                                    host: account.smtp_host,
                                    port: account.smtp_port,
                                    secure: account.smtp_port === 465,
                                    auth: {
                                        user: account.email_address,
                                        pass: decryptedPassword,
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                await transporter.sendMail({
                                    from: account.email_address,
                                    to: replyToEmail,
                                    subject: `Re: ${subject}`,
                                    text: replyBody,
                                    headers: { 'X-Warmup-Hero': 'true' } // Mark reply as warmup too? Yes, good for continuity.
                                });
                            }

                            // Logs
                            await supabase.from('email_logs').insert({
                                account_id: account.id,
                                type: 'RECEIVED',
                                status: 'RESCUED',
                                details: {
                                    subject: subject,
                                    from: from,
                                    action: 'Replied'
                                }
                            });
                        } catch (moveAuthErr) {
                            console.error('Error rescuing message', moveAuthErr);
                        }
                    }
                    results.push({ account: account.email_address, rescued: messages.length });
                } else {
                    results.push({ account: account.email_address, status: 'Clean' });
                }

                connection.end();

            } catch (err: unknown) {
                const error = err as Error;
                console.error(`Error checking ${account.email_address}:`, error);
                results.push({ account: account.email_address, error: error.message });
                if (connection) connection.end();

                // 4. Error Handling
                if (error.message && (error.message.includes('authentication') || error.message.includes('LogIn') || error.message.includes('NO'))) {
                    // "NO" response often implies auth fail or box not found, but let's be careful.
                    // Only update if strictly auth related usually.
                    if (error.message.includes('auth') || error.message.includes('credentials')) {
                        await supabase.from('email_accounts').update({ status: 'ERROR_AUTH' }).eq('id', account.id);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
