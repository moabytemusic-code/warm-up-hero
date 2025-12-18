'use client'

import { useFormState } from 'react-dom'
import { connectAccount } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useEffect } from 'react'

const initialState = {
    message: '',
    error: '',
    success: false
}

export function ConnectAccountForm() {
    const [state, formAction] = useFormState(connectAccount, initialState)

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
        } else if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Connect Email Account</CardTitle>
                <CardDescription>Enter your SMTP and IMAP credentials to integrate with the Warm Up Network.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Account Name</Label>
                            <Input id="name" name="name" placeholder="My Work Email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password (App Password recommended)</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide">SMTP Settings (Sending)</h3>
                            <div className="space-y-2">
                                <Label htmlFor="smtpHost">SMTP Host</Label>
                                <Input id="smtpHost" name="smtpHost" placeholder="smtp.gmail.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smtpPort">SMTP Port</Label>
                                <Input id="smtpPort" name="smtpPort" placeholder="465" defaultValue="465" required />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide">IMAP Settings (Reading)</h3>
                            <div className="space-y-2">
                                <Label htmlFor="imapHost">IMAP Host</Label>
                                <Input id="imapHost" name="imapHost" placeholder="imap.gmail.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imapPort">IMAP Port</Label>
                                <Input id="imapPort" name="imapPort" placeholder="993" defaultValue="993" required />
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-6 flex justify-end">
                    <Button type="submit" className="w-full md:w-auto">Connect & Verify Account</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
