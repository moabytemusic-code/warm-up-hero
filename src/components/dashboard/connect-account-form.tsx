'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { connectAccount } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// 1. Config: Provider Settings (Auto-Discovery)
const PROVIDER_SETTINGS: Record<string, { smtp: string; smtpPort: number; imap: string; imapPort: number }> = {
    'gmail.com': { smtp: 'smtp.gmail.com', smtpPort: 465, imap: 'imap.gmail.com', imapPort: 993 },
    'googlemail.com': { smtp: 'smtp.gmail.com', smtpPort: 465, imap: 'imap.gmail.com', imapPort: 993 },
    'outlook.com': { smtp: 'smtp.office365.com', smtpPort: 587, imap: 'outlook.office365.com', imapPort: 993 },
    'hotmail.com': { smtp: 'smtp.office365.com', smtpPort: 587, imap: 'outlook.office365.com', imapPort: 993 },
    'live.com': { smtp: 'smtp.office365.com', smtpPort: 587, imap: 'outlook.office365.com', imapPort: 993 },
    'zoho.com': { smtp: 'smtp.zoho.com', smtpPort: 465, imap: 'imap.zoho.com', imapPort: 993 },
    'icloud.com': { smtp: 'smtp.mail.me.com', smtpPort: 587, imap: 'imap.mail.me.com', imapPort: 993 },
    'me.com': { smtp: 'smtp.mail.me.com', smtpPort: 587, imap: 'imap.mail.me.com', imapPort: 993 },
}

// 2. Schema
const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    smtpHost: z.string().min(1, 'SMTP Host is required'),
    smtpPort: z.coerce.number().min(1, 'Invalid Port'),
    imapHost: z.string().min(1, 'IMAP Host is required'),
    imapPort: z.coerce.number().min(1, 'Invalid Port'),
})

export function ConnectAccountForm() {
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            password: '',
            smtpHost: '',
            smtpPort: 465,
            imapHost: '',
            imapPort: 993,
        },
    })

    // Auto-Discovery Logic
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        form.setValue('email', email)

        if (email.includes('@')) {
            const domain = email.split('@')[1].toLowerCase()
            const settings = PROVIDER_SETTINGS[domain]
            if (settings) {
                form.setValue('smtpHost', settings.smtp)
                form.setValue('smtpPort', settings.smtpPort)
                form.setValue('imapHost', settings.imap)
                form.setValue('imapPort', settings.imapPort)
            }
        }
    }

    // Dynamic Tip helper
    const getEmailTip = () => {
        const email = form.watch('email');
        if (!email) return null;
        if (email.includes('gmail.com') || email.includes('googlemail.com')) {
            return (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                    Using Gmail? You must generate an App Password. <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noreferrer" className="underline font-medium">Click here to see how.</a>
                </span>
            )
        }
        if (email.includes('outlook.com') || email.includes('hotmail.com') || email.includes('live.com')) {
            return (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                    Using Outlook? Ensure SMTP auth is enabled in your account settings.
                </span>
            )
        }
        return null;
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setStatus('loading')
        setErrorMessage('')
        setStatusMessage('Connecting to SMTP...')

        // Simulate step delay for UX (as requested "Connecting... -> Verifying...")
        // Real connection happens in server action, but we can fake the "phases" visually if we want,
        // or just rely on the server delay. 
        // Let's just set the initial message.

        try {
            const formData = new FormData()
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value.toString())
            })

            // Trigger "Verifying IMAP" after a short delay to simulate progress if it takes long
            const progressTimer = setTimeout(() => setStatusMessage('Verifying IMAP...'), 1500)

            const result = await connectAccount(null as any, formData) // null for initial state

            clearTimeout(progressTimer)

            if (result.success) {
                setStatus('success')
                setStatusMessage('Success! Account verified and connected.')
                form.reset()
                // Optional: Refresh page or redirect
                // location.reload() 
            } else {
                setStatus('error')
                setErrorMessage(result.error || 'Failed to connect.')
            }
        } catch (error) {
            setStatus('error')
            setErrorMessage('An unexpected error occurred.')
            console.error(error)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-1">
            {status === 'success' ? (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Connected!</AlertTitle>
                    <AlertDescription>
                        Your account has been successfully verified and added to the warmup network.
                    </AlertDescription>
                    <Button variant="outline" size="sm" className="mt-4 border-green-300 hover:bg-green-100" onClick={() => setStatus('idle')}>
                        Add Another Account
                    </Button>
                </Alert>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Identity */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@company.com"
                                                {...field}
                                                onChange={handleEmailChange} // Override to hook into change
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Step 2: Security */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••••••" {...field} />
                                    </FormControl>
                                    {getEmailTip() && (
                                        <FormDescription className="mt-1">
                                            {getEmailTip()}
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Advanced Settings */}
                        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="w-full space-y-2 border rounded-md p-4 bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Server Settings
                                </h4>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-9 p-0">
                                        {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="sr-only">Toggle</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className='space-y-3'>
                                        <p className="text-xs font-medium text-zinc-500 uppercase">Outgoing (SMTP)</p>
                                        <FormField
                                            control={form.control}
                                            name="smtpHost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Host</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="smtpPort"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Port</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-3'>
                                        <p className="text-xs font-medium text-zinc-500 uppercase">Incoming (IMAP)</p>
                                        <FormField
                                            control={form.control}
                                            name="imapHost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Host</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="imapPort"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Port</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Error Alert */}
                        {status === 'error' && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Connection Failed</AlertTitle>
                                <AlertDescription>
                                    {errorMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit */}
                        <Button type="submit" className="w-full" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {statusMessage}
                                </>
                            ) : (
                                "Connect & Verify Account"
                            )}
                        </Button>

                    </form>
                </Form>
            )}
        </div>
    )
}
