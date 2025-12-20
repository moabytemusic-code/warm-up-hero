
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft, Mail, Zap, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CheckoutButton } from '@/components/billing/checkout-button';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {

    // FETCH USER PLAN
    // For MVP, since we don't have full auth context passed around yet, 
    // we fetch the single demo user we know exists or create logic. 
    // In a real app, we'd use `await supabase.auth.getUser()`.
    // Here we'll just grab the most recently created user or a fixed demo user for display context.

    const { data: users } = await supabase.from('users').select('*').limit(1);
    const user = users && users.length > 0 ? users[0] : null;
    const currentPlan = user?.subscription_status || 'free';

    const plans = [
        {
            key: 'free',
            name: 'Free',
            price: '$0',
            description: 'For testing and small volume.',
            features: [
                '1 Email Account',
                '5 Warmup Emails / Day',
                'Basic Spam Rescue',
                'Community Support'
            ],
            icon: Mail
        },
        {
            key: 'starter',
            name: 'Starter',
            price: '$29',
            period: '/mo',
            description: 'Perfect for solo founders & freelancers.',
            features: [
                '3 Email Accounts',
                '50 Emails / Account / Day',
                'Priority Spam Rescue',
                'Smart Reply AI',
                'Email Support'
            ],
            popular: true,
            icon: Zap
        },
        {
            key: 'agency',
            name: 'Agency',
            price: '$99',
            period: '/mo',
            description: 'For agencies managing multiple clients.',
            features: [
                'Unlimited Accounts',
                '200 Emails / Account / Day',
                'Dedicated IP Pool Access',
                'White-label Reports',
                '24/7 Priority Support'
            ],
            icon: Building
        }
    ];

    return (
        <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-800 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Plans & Billing
                        </h1>
                        <p className="text-zinc-500 mt-2 text-lg">
                            Upgrade your warmup capacity and restore your reputation faster.
                        </p>
                    </div>
                </header>

                {/* Current Plan Indicator */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Current Plan</p>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                            {currentPlan} Tier
                        </h2>
                    </div>
                    {currentPlan === 'free' && (
                        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium border border-orange-100">
                            Upgrade Recommended
                        </div>
                    )}
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan === plan.key;
                        const Icon = plan.icon;

                        return (
                            <Card
                                key={plan.key}
                                className={`relative flex flex-col ${plan.popular ? 'border-orange-500 shadow-xl scale-105 z-10' : 'border-zinc-200 hover:border-zinc-300'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        MOST POPULAR
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-900 dark:text-zinc-100">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{plan.price}</span>
                                        {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center">
                                                <Check className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <CheckoutButton
                                        planId={plan.key}
                                        userId={user?.id || ''}
                                        isCurrent={isCurrent}
                                        isPopular={plan.popular}
                                    />
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center text-sm text-zinc-400 py-8">
                    Secure payments processed by Stripe. You can cancel at any time.
                </div>

            </div>
        </main>
    );
}
