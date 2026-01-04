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
        } catch {
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
        } catch {
            toast.error('Failed to trigger inbox check')
        } finally {
            setChecking(false)
        }
    }

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Warmup Engine Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={triggerSend}
                    disabled={sending}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Trigger Send Run
                </Button>
                <Button
                    variant="secondary"
                    onClick={triggerCheck}
                    disabled={checking}
                    className="w-full sm:w-auto"
                >
                    {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Inbox className="w-4 h-4 mr-2" />}
                    Trigger Inbox Check
                </Button>
            </CardContent>
        </Card>
    )
}
