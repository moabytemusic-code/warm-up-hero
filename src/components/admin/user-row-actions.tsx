'use client'

import { Button } from '@/components/ui/button'
import { updateUserPlan } from '@/app/admin/actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserRowActions({ userId, currentPlan }: { userId: string, currentPlan: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handlePlanChange = async (newPlan: string) => {
        setIsLoading(true)
        try {
            await updateUserPlan(userId, newPlan)
            router.refresh()
        } catch (error) {
            console.error('Failed to update plan', error)
            alert('Failed to update plan')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <select
                disabled={isLoading}
                value={currentPlan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
            >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
            </select>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-zinc-500 my-auto" />}
        </div>
    )
}
