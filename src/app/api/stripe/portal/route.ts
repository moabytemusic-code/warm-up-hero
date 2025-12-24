
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Get user email to find customer in Stripe
        // Ideally we store stripe_customer_id in DB, but checking by email works if 1-to-1
        const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();

        if (!user?.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find customer by email
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
        }

        const customerId = customers.data[0].id;

        // Robust Base URL
        let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
            || process.env.VERCEL_URL
            || 'http://localhost:3000';

        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (baseUrl.includes('localhost')) {
            baseUrl = 'http://localhost:3000';
        }

        // Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${baseUrl}/billing`,
        });

        return NextResponse.json({ url: session.url });

    } catch (err: unknown) {
        const error = err as Error;
        console.error('Stripe Portal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
