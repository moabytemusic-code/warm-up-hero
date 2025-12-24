
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { plan, userId } = await req.json();

        if (!plan || !userId) {
            return NextResponse.json({ error: 'Missing plan or userId' }, { status: 400 });
        }

        const priceId = plan === 'starter'
            ? process.env.STRIPE_PRICE_ID_STARTER
            : process.env.STRIPE_PRICE_ID_AGENCY;

        if (!priceId) {
            console.error('Missing Price ID for plan:', plan);
            return NextResponse.json({
                error: 'Billing configuration missing. Please report this to support.'
            }, { status: 500 });
        }

        // Fetch user email for pre-fill
        const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();

        // Robust Base URL for Production
        let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
            || process.env.VERCEL_URL
            || 'http://localhost:3000';

        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`; // Vercel URLs don't have protocol
        }

        // Localhost fallback
        if (baseUrl.includes('localhost')) {
            baseUrl = 'http://localhost:3000';
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/?checkout_success=true`,
            cancel_url: `${baseUrl}/billing?canceled=true`,
            customer_email: user?.email,
            metadata: {
                userId: userId,
                plan: plan
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (err: unknown) {
        const error = err as Error;
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
