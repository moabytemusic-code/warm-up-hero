import { NextResponse } from 'next/server';
import imaps from 'imap-simple';
import { createTransport } from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/utils/encryption';
import { generateReplyContent } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const SPAM_BOX_NAMES = ['spam', 'junk', 'bulk', 'junk e-mail', 'junk email'];

export async function POST(req: Request) {
    return handleCheckRequest(req);
}

export async function GET(req: Request) {
    return handleCheckRequest(req);
}

async function handleCheckRequest(req: Request) {
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

                // Recursive function to find spam box path with correct delimiter
                const searchCtx = { found: false, path: '' };

                const traverseBoxes = (boxList: any, parentPath: string = "") => {
                    if (searchCtx.found) return;

                    for (const key in boxList) {
                        const box = boxList[key];
                        // Determine path (handling delimiters if we knew them, but ImapSimple usually returns nested structure)
                        // However, opening a box requires the full path name.
                        // Typical convention: "Parent/Child" or "Parent.Child"
                        // We will construct path based on key, but we need the delimiter. 
                        // Using the delimiter from the box attributes is best, but imap-simple structure is tricky.
                        // Let's assume the delimiter is standard '/' or '.' or we just build it.
                        // ACTUALLY: imap-simple doesn't easily expose the delimiter in getBoxes() result without parsing attributes.
                        // Simplify: Check the key name against our list.

                        const lowerKey = key.toLowerCase();
                        let isSpam = SPAM_BOX_NAMES.includes(lowerKey);

                        // Construct the path for this node.
                        // Note: The Key in the object *is* the name of the segment.
                        // The delimiter is specific to the server. 
                        // Safe bet: [Gmail]/Spam is a known full path? No, [Gmail] is parent, Spam is child.

                        let currentPath = parentPath ? `${parentPath}${box.delimiter}${key}` : key;
                        // Since we don't have 'box.delimiter' easily here (it's in the attr usually), 
                        // we'll try to infer or just use the box name if top level.
                        // Let's rely on standard patterns.

                        if (isSpam) {
                            spamBoxPath = parentPath ? (parentPath + '/' + key) : key; // Try forward slash as generic guess if nested
                            // Better: If it's nested like [Gmail], construct it.
                            // Let's try to detect [Gmail] specifically.
                            if (parentPath === '[Gmail]') {
                                spamBoxPath = `[Gmail]/${key}`;
                            } else {
                                spamBoxPath = key; // Top level
                            }
                            searchCtx.found = true;
                            return;
                        }

                        // Recurse
                        if (box.children) {
                            traverseBoxes(box.children, key);
                        }
                    }
                };

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
                            await connection.moveMessage(uid as any, 'INBOX');

                            // 3. Extract Info for Reply
                            const headerPart = message.parts.find((p: any) => p.which === 'HEADER');
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

            } catch (err: any) {
                console.error(`Error checking ${account.email_address}:`, err);
                results.push({ account: account.email_address, error: err.message });
                if (connection) connection.end();

                // 4. Error Handling
                if (err.message && (err.message.includes('authentication') || err.message.includes('LogIn') || err.message.includes('NO'))) {
                    // "NO" response often implies auth fail or box not found, but let's be careful.
                    // Only update if strictly auth related usually.
                    if (err.message.includes('auth') || err.message.includes('credentials')) {
                        await supabase.from('email_accounts').update({ status: 'ERROR_AUTH' }).eq('id', account.id);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
