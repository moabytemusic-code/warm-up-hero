
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`Webhook signature verification failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve custom metadata
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan; // 'starter' or 'agency'

        console.log(`💰 Payment success for User: ${userId}, Plan: ${plan}`);

        if (userId && plan) {
            // Update User Subscription
            const { error: userError } = await supabase
                .from('users')
                .update({ subscription_status: plan })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user subscription:', userError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            // Update Account Daily Limits based on new plan
            const dailyLimits: Record<string, number> = {
                'starter': 50,
                'agency': 200
            };
            const newLimit = dailyLimits[plan] || 5;

            const { error: accError } = await supabase
                .from('email_accounts')
                .update({ daily_limit: newLimit })
                .eq('user_id', userId);

            if (accError) {
                console.error('Error updating account limits:', accError);
            }
        }
    }

    return NextResponse.json({ received: true });
}
