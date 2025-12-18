'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Inbox, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DebugActions() {
    const [sending, setSending] = useState(false)
    const [checking, setChecking] = useState(false)

    const triggerSend = async () => {
        setSending(true)
        try {
            const res = await fetch('/api/warmup/send', { method: 'POST' })
            const data = await res.json()
            if (data.results) {
                toast.success(`Warmup Run Complete`, { description: `${data.results.length} emails sent.` })
            } else {
                toast.info(data.message || 'No action taken.')
            }
        } catch (e) {
            toast.error('Failed to trigger warmup send')
        } finally {
            setSending(false)
        }
    }

    const triggerCheck = async () => {
        setChecking(true)
        try {
            const res = await fetch('/api/warmup/check', { method: 'POST' })
            const data = await res.json()
            if (data.results) {
                toast.success(`Inbox Check Complete`, { description: `Rescued ${data.results.length} emails.` })
            } else {
                toast.info(data.message || 'No action taken.')
            }
        } catch (e) {
            toast.error('Failed to trigger inbox check')
        } finally {
            setChecking(false)
        }
    }

    return (
        <Card className="border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Engine Controls (Dev Mode)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={triggerSend}
                    disabled={sending}
                    className="w-full sm:w-auto"
                >
                    {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 text-blue-500" />}
                    Trigger Send Run
                </Button>
                <Button
                    variant="outline"
                    onClick={triggerCheck}
                    disabled={checking}
                    className="w-full sm:w-auto"
                >
                    {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Inbox className="w-4 h-4 mr-2 text-orange-500" />}
                    Trigger Inbox Check
                </Button>
            </CardContent>
        </Card>
    )
}
