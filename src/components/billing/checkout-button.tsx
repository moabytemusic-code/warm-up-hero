
'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutButtonProps {
    planId: string;
    userId: string;
    isCurrent: boolean;
    isPopular?: boolean;
}

export function CheckoutButton({ planId, userId, isCurrent, isPopular }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        // If current plan (and not free), go to Portal
        if (isCurrent && planId !== 'free') {
            setLoading(true);
            try {
                const res = await fetch('/api/stripe/portal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else {
                    toast.error(data.error || 'Failed to load portal');
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load portal');
                setLoading(false);
            }
            return;
        }

        if (planId === 'free') return; // No checkout for free

        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId, userId })
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to start checkout');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
            setLoading(false);
        }
    };

    if (planId === 'free') {
        return (
            <Button
                className="w-full" variant="outline" disabled
            >
                {isCurrent ? "Current Plan" : "Downgrade (Contact Support)"}
            </Button>
        );
    }

    return (
        <Button
            className={`w-full ${isPopular ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0' : ''}`}
            variant={isCurrent ? "outline" : (isPopular ? "default" : "outline")}
            disabled={loading}
            onClick={handleCheckout}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCurrent ? "Manage Subscription" : "Upgrade Now")}
        </Button>
    );
}
