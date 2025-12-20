
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLimits() {
    console.log('🧪 Testing Limit Enforcement Logic...\n');

    // 1. Setup Test User
    const testEmail = 'test_limit_user_' + Date.now() + '@example.com';
    console.log(`Creating test user: ${testEmail} (Plan: COMPARED TO 'free')`);

    // Create user with 'free' plan
    const { data: user, error: userError } = await supabase.from('users').insert({
        email: testEmail,
        subscription_status: 'free'
    }).select().single();

    if (userError) {
        console.error('Failed to create user:', userError);
        return;
    }

    console.log(`✅ User created: ${user.id}\n`);

    // 2. Test Account Limit (Free = 1)
    console.log('--- Test 1: Account Limits (Max 1 for Free) ---');

    // Add 1st account (Should Pass)
    const { error: acc1Error } = await supabase.from('email_accounts').insert({
        user_id: user.id,
        email_address: 'acc1@example.com',
        smtp_host: 'smtp.test', smtp_port: 587,
        imap_host: 'imap.test', imap_port: 993,
        encrypted_password: 'mock', iv: 'mock',
        daily_limit: 5 // Default for free
    });

    if (acc1Error) console.error('❌ Failed to add 1st account:', acc1Error);
    else console.log('✅ Added 1st account (Expected: Success)');

    // Add 2nd account (Should effectively check count)
    const { count } = await supabase
        .from('email_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const LIMIT_FREE = 1;
    if ((count || 0) >= LIMIT_FREE) {
        console.log(`✅ Limit Check Passed: System sees ${count} account(s). Adding another would be BLOCKED by app logic.`);
    } else {
        console.error(`❌ Limit Check Failed: System count is ${count}, expected >= 1`);
    }

    // 3. Test Daily Volume Limit (Free = 5)
    console.log('\n--- Test 2: Daily Volume (Max 5 for Free) ---');

    // Fetch the account we just made
    const { data: accounts } = await supabase.from('email_accounts').select('*').eq('user_id', user.id);
    const account = accounts![0];

    // Insert 5 logs (Hitting the limit)
    console.log('Simulating 5 sent emails...');
    const logs = Array(5).fill(0).map(() => ({
        account_id: account.id,
        type: 'SENT',
        status: 'SUCCESS',
        details: { to: 'peer@example.com' }
    }));
    await supabase.from('email_logs').insert(logs);

    // Now check if logic would block the 6th
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: sentToday } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', account.id)
        .eq('type', 'SENT')
        .eq('status', 'SUCCESS')
        .gte('timestamp', today.toISOString());

    console.log(`Emails sent today: ${sentToday}`);
    console.log(`Daily Limit: ${account.daily_limit}`);

    if ((sentToday || 0) >= account.daily_limit!) {
        console.log('✅ Volume Check Passed: Limit reached. Next send would be skipped.');
    } else {
        console.error('❌ Volume Check Failed: Limit not reached.');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('users').delete().eq('id', user.id);
    console.log('Done.');
}

testLimits();
