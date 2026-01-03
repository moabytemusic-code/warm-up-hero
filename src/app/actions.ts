'use server'

import { createTransport } from 'nodemailer';
import imaps from 'imap-simple';
import { encrypt } from '@/utils/encryption';
import { createClient } from '@/utils/supabase/server';
import { supabase as supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface ConnectAccountState {
    message?: string;
    error?: string;
    success?: boolean;
}

export async function connectAccount(prevState: ConnectAccountState, formData: FormData): Promise<ConnectAccountState> {

    const supabase = await createClient();

    const email = (formData.get('email') as string)?.trim();
    const smtpHost = (formData.get('smtpHost') as string)?.trim();
    const smtpPort = parseInt(formData.get('smtpPort') as string);
    const imapHost = (formData.get('imapHost') as string)?.trim();
    const imapPort = parseInt(formData.get('imapPort') as string);
    const password = (formData.get('password') as string)?.trim();

    if (!email || !password || !smtpHost || !imapHost) {
        return { error: 'Missing required fields' };
    }

    try {
        // 1. Verify SMTP
        // Heuristic: 465 is usually implicit SSL/TLS. 587 is STARTTLS (secure: false).
        const isSecureSmtp = smtpPort === 465;

        const transporter = createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: isSecureSmtp,
            auth: {
                user: email,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP Verified.');

        // 2. Verify IMAP
        const isSecureImap = imapPort === 993;
        const imapConfig = {
            imap: {
                user: email,
                password: password,
                host: imapHost,
                port: imapPort,
                tls: isSecureImap,
                authTimeout: 10000,
                tlsOptions: { rejectUnauthorized: false } // Modify as needed for production security
            },
        };

        console.log('Verifying IMAP connection...');
        const connection = await imaps.connect(imapConfig);
        await connection.end();
        console.log('IMAP Verified.');

        // 3. Encrypt Password
        const { encryptedData, iv } = encrypt(password);


        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            throw new Error('Unauthorized: Please log in.');
        }

        const userId = authUser.id;

        // Check if user has a profile in 'users' table (created via trigger usually, or we create now)
        // For MVP, we'll assume triggers or manual check.
        // Let's safe-check and create if missing (although usually auth hooks do this)
        // USE ADMIN CLIENT FOR DB OPERATIONS TO AVOID RLS ISSUES DURING SETUP
        const { data: userProfile, error: profileError } = await supabaseAdmin.from('users').select('subscription_status').eq('id', userId).single();

        let subscriptionStatus = 'free';

        if (!userProfile) {
            // Create profile on the fly if missing (e.g. first login)
            const { error: createError } = await supabaseAdmin.from('users').insert({
                id: userId,
                email: authUser.email,
                subscription_status: 'free'
            });
            if (createError && createError.code !== '23505') { // Ignore duplicate key error
                console.error("Error creating user profile", createError);
                throw new Error("Failed to initialize user profile.");
            }
        } else {
            subscriptionStatus = userProfile.subscription_status || 'free';
        }


        // --- ENFORCE LIMITS ---
        const { count: currentAccountCount } = await supabaseAdmin
            .from('email_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const limits: Record<string, number> = {
            'free': 1,
            'starter': 3,
            'agency': 9999
        };

        const limit = limits[subscriptionStatus] || 1;

        if ((currentAccountCount || 0) >= limit) {
            return { error: `Upgrade required. Your ${subscriptionStatus} plan is limited to ${limit} account(s).` };
        }

        // --- SET DAILY LIMIT BASED ON TIER ---
        const dailyLimits: Record<string, number> = {
            'free': 5,
            'starter': 50,
            'agency': 200
        };
        const dailyLimit = dailyLimits[subscriptionStatus] || 5;


        // 5. Save Account
        const { error: dbError } = await supabaseAdmin.from('email_accounts').insert({
            user_id: userId,
            email_address: email,
            smtp_host: smtpHost,
            smtp_port: smtpPort,
            imap_host: imapHost,
            imap_port: imapPort,
            encrypted_password: encryptedData,
            iv: iv,
            daily_limit: dailyLimit,
            current_warmup_score: 0
        });

        if (dbError) {
            console.error('Database Insert Error:', dbError);
            throw new Error(dbError.message);
        }

        revalidatePath('/dashboard');
        return { success: true, message: 'Account connected successfully!' };

    } catch (err: unknown) {
        console.error('Connection Error:', err);
        const errorObject = err as Error;
        // Return a friendly error message
        let msg = errorObject.message || 'Failed to connect account';
        if (msg.includes('Invalid login')) {
            msg = 'Invalid email or password.';
            if (email.includes('gmail.com')) {
                msg += ' For Gmail, you must use an App Password, not your login password.';
            }
        }
        if (msg.includes('ENOTFOUND')) msg = 'Host not found. Check your SMTP/IMAP server details.';
        return { error: msg };
    }
}

export async function deleteAccount(accountId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('email_accounts').delete().eq('id', accountId);

    if (error) {
        console.error('Delete Account Error:', error);
        throw new Error('Failed to delete account');
    }
    revalidatePath('/dashboard');
}

export interface DashboardStats {
    healthScore: number;
    dailyVolume: number;
    dailyLimit: number; // hardcoded for MVP
    rescueCount: number;
    graphData: { date: string; inboxRate: number; sent: number }[];
    feed: { id: string; type: 'SENT' | 'RECEIVED' | string; message: string; timestamp: string }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();
    try {
        // 1. Fetch Logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: sentLogs } = await supabase
            .from('email_logs')
            .select('*')
            .eq('type', 'SENT')
            .gte('timestamp', today.toISOString());

        const { data: allRescued } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact' })
            .eq('status', 'RESCUED');

        // Calculate Stats
        const dailyVolume = sentLogs?.length || 0;
        const rescueCount = allRescued?.length || 0;

        // Mock Graph Data & Feed if low volume (MVP Mode)
        // CHANGED: Show real data as soon as we have ANY activity (>0)
        if (dailyVolume === 0 && rescueCount === 0) {
            return getMockDashboardStats();
        }

        // Real Health Score Calculation (Simplified Proxy)
        // Score = 100 - (Rescued / Sent * 100)
        // If we rescued 5 out of 50 sent, that's 10% spam rate -> 90% Health.
        const { count: totalSentCount } = await supabase.from('email_logs').select('*', { count: 'exact', head: true }).eq('type', 'SENT');
        const totalSent = totalSentCount || 1;
        const spamRate = (rescueCount / totalSent);
        let healthScore = Math.round((1 - spamRate) * 100);
        if (healthScore < 0) healthScore = 0;

        // Feed
        const { data: feedLogs } = await supabase
            .from('email_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        const feed = feedLogs?.map(log => {
            let msg = '';
            let email = '';
            if (log.type === 'SENT') {
                email = log.details?.to || 'unknown';
                msg = `Sent email to ${maskEmail(email)}`;
            } else {
                email = log.details?.from || 'unknown';
                msg = `Rescued email from ${maskEmail(email)}`;
            }
            return {
                id: log.id,
                type: log.type,
                message: msg,
                timestamp: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        }) || [];

        // Simple Graph Data (Last 14 days) - Heavy Query strictly for MVP we simulate history based on current score
        // In reality, we'd group by date.
        const graphData = Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return {
                date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                inboxRate: Math.min(100, Math.max(70, healthScore + (Math.random() * 10 - 5))), // variance around current score
                sent: Math.floor(Math.random() * 20) + 10
            };
        });

        return {
            healthScore,
            dailyVolume,
            dailyLimit: 50,
            rescueCount,
            graphData,
            feed
        };

    } catch (e) {
        console.error('Stats Error:', e);
        return getMockDashboardStats();
    }
}

function maskEmail(email: string) {
    if (!email) return 'unknown';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : `${name}***`;
    return `${maskedName}@${domain}`;
}

function getMockDashboardStats(): DashboardStats {

    // Generate last 14 days
    const graphData = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        // Simulate upward trend
        const baseRate = 60 + (i * 2.5);
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            inboxRate: Math.min(98, Math.round(baseRate + (Math.random() * 10 - 5))),
            sent: Math.floor(Math.random() * 30) + 15
        };
    });

    return {
        healthScore: 84, // Yellow/Green
        dailyVolume: 12,
        dailyLimit: 50,
        rescueCount: 143,
        graphData,
        feed: [
            { id: '1', type: 'SENT', message: 'Sent email to ka***@gmail.com', timestamp: '10:42 AM' },
            { id: '2', type: 'RECEIVED', message: 'Rescued email from al***@outlook.com', timestamp: '10:30 AM' },
            { id: '3', type: 'SENT', message: 'Sent email to jo***@yahoo.com', timestamp: '09:15 AM' },
            { id: '4', type: 'RECEIVED', message: 'Checking inbox for new spam...', timestamp: '09:00 AM' },
            { id: '5', type: 'SENT', message: 'Sent email to he***@company.com', timestamp: '08:45 AM' },
        ]
    };
}

export interface EmailAccount {
    id: string;
    email_address: string;
    daily_limit: number;
    current_warmup_score: number;
    created_at: string;
    // We might not have a status status column yet, so we'll simulate or ignore for now
    // status: 'active' | 'paused' | 'error'; 
}

export async function getConnectedAccounts(): Promise<EmailAccount[]> {
    const supabase = await createClient();
    try {
        const { data: accounts, error } = await supabase
            .from('email_accounts')
            .select('id, email_address, daily_limit, current_warmup_score, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }

        return accounts as EmailAccount[];
    } catch (e) {
        console.error('Unexpected error fetching accounts:', e);
        return [];
    }
}
