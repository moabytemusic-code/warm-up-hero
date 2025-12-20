
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
let secretKey = process.env.STRIPE_SECRET_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && key.trim() === 'STRIPE_SECRET_KEY') {
            secretKey = value.trim();
        }
    });
}

if (!secretKey || secretKey.includes('sk_test_...')) {
    console.error('❌ STRIPE_SECRET_KEY is missing or invalid in .env.local');
    console.log('Please get your Test Secret Key from: https://dashboard.stripe.com/test/apikeys');
    process.exit(1);
}

const stripe = new Stripe(secretKey, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
});

async function setupProducts() {
    console.log('🚀 Setting up Stripe Products...\n');

    try {
        // 1. Create Starter Plan
        console.log('Creating "Warm Up Hero - Starter Plan"...');
        const starter = await stripe.products.create({
            name: 'Warm Up Hero - Starter',
            description: '3 Email Accounts, 50 Emails/Day',
        });

        const starterPrice = await stripe.prices.create({
            product: starter.id,
            unit_amount: 2900, // $29.00
            currency: 'usd',
            recurring: { interval: 'month' },
        });

        console.log(`✅ Created Starter Price ID: ${starterPrice.id}`);

        // 2. Create Agency Plan
        console.log('Creating "Warm Up Hero - Agency Plan"...');
        const agency = await stripe.products.create({
            name: 'Warm Up Hero - Agency',
            description: 'Unlimited Email Accounts, 200 Emails/Day',
        });

        const agencyPrice = await stripe.prices.create({
            product: agency.id,
            unit_amount: 9900, // $99.00
            currency: 'usd',
            recurring: { interval: 'month' },
        });

        console.log(`✅ Created Agency Price ID:  ${agencyPrice.id}`);

        console.log('\nPlease update your .env.local file with these IDs:');
        console.log('---------------------------------------------------');
        console.log(`STRIPE_PRICE_ID_STARTER=${starterPrice.id}`);
        console.log(`STRIPE_PRICE_ID_AGENCY=${agencyPrice.id}`);
        console.log('---------------------------------------------------');

    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error('❌ Error creating products:', error.message);
    }
}

setupProducts();
