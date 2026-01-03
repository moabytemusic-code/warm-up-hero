'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
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
import { cn } from '@/lib/utils'

// 1. Config: Provider Settings & Metadata
type ProviderId = 'gmail' | 'outlook' | 'icloud' | 'zoho' | 'custom'

const PROVIDERS: Record<ProviderId, {
    name: string;
    icon: React.ReactNode;
    color: string;
    smtp?: string;
    smtpPort?: number;
    imap?: string;
    imapPort?: number;
    passwordLabel?: string;
    helperText?: string;
    helperLink?: string;
}> = {
    'gmail': {
        name: 'Gmail / G-Suite',
        icon: <Mail className="w-6 h-6" />,
        color: 'from-blue-500 to-red-500', // Google colors roughly
        smtp: 'smtp.gmail.com', smtpPort: 465, imap: 'imap.gmail.com', imapPort: 993,
        passwordLabel: 'App Password',
        helperText: 'Your regular Gmail password will NOT work. You must generate an App Password.',
        helperLink: 'https://support.google.com/accounts/answer/185833'
    },
    'outlook': {
        name: 'Outlook / Office 365',
        icon: <Mail className="w-6 h-6" />,
        color: 'from-blue-400 to-blue-600',
        smtp: 'smtp.office365.com', smtpPort: 587, imap: 'outlook.office365.com', imapPort: 993,
        passwordLabel: 'Password',
        helperText: 'Use your Microsoft account password. Ensure SMTP is enabled in settings.'
    },
    'icloud': {
        name: 'iCloud Mail',
        icon: <Mail className="w-6 h-6" />,
        color: 'from-blue-300 to-blue-400',
        smtp: 'smtp.mail.me.com', smtpPort: 587, imap: 'imap.mail.me.com', imapPort: 993,
        passwordLabel: 'App-Specific Password',
        helperText: 'You must generate an App-Specific password from your Apple ID dashboard.',
        helperLink: 'https://support.apple.com/en-us/HT204397'
    },
    'zoho': {
        name: 'Zoho Mail',
        icon: <Mail className="w-6 h-6" />,
        color: 'from-yellow-400 to-yellow-500',
        smtp: 'smtp.zoho.com', smtpPort: 465, imap: 'imap.zoho.com', imapPort: 993,
        passwordLabel: 'Password',
        helperText: 'Use your Zoho password. If 2FA is on, use an App Password.'
    },
    'custom': {
        name: 'Other Provider',
        icon: <ShieldCheck className="w-6 h-6" />,
        color: 'from-zinc-800 to-zinc-950',
        passwordLabel: 'Password',
        helperText: 'Enter your provider\'s IMAP/SMTP details manually.'
    }
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
    const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null)
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const form = useForm<z.infer<typeof formSchema>>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Handle Provider Selection
    const selectProvider = (id: ProviderId) => {
        setSelectedProvider(id)
        const config = PROVIDERS[id]
        if (id !== 'custom' && config.smtp && config.imap) {
            form.setValue('smtpHost', config.smtp)
            form.setValue('smtpPort', config.smtpPort!)
            form.setValue('imapHost', config.imap)
            form.setValue('imapPort', config.imapPort!)
        } else {
            // Reset or keep empty for custom
            form.setValue('smtpHost', '')
            form.setValue('smtpPort', 465)
            form.setValue('imapHost', '')
            form.setValue('imapPort', 993)
            setAdvancedOpen(true) // Open advanced for custom automatically
        }
        setErrorMessage('')
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setStatus('loading')
        setErrorMessage('')
        setStatusMessage('Connecting to SMTP...')

        try {
            const formData = new FormData()
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value.toString())
            })

            const progressTimer = setTimeout(() => setStatusMessage('Verifying IMAP...'), 1500)
            const result = await connectAccount({}, formData)
            clearTimeout(progressTimer)

            if (result.success) {
                setStatus('success')
                setStatusMessage('Success! Account verified and connected.')
                form.reset()
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

    // Success View
    if (status === 'success') {
        return (
            <div className="w-full max-w-2xl mx-auto p-1 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Connected!</h3>
                <p className="text-zinc-500 mb-6">Your account has been added to the network.</p>
                <Button onClick={() => { setStatus('idle'); setSelectedProvider(null); }}>
                    Add Another Account
                </Button>
            </div>
        )
    }

    // Step 1: Provider Selector
    if (!selectedProvider) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Select your email provider to get started:</p>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PROVIDERS).map(([id, config]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => selectProvider(id as ProviderId)}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 group text-center h-28 space-y-3 shadow-sm hover:shadow-md",
                                id === 'custom' && "col-span-2 flex-row md:col-span-1 md:flex-col"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-sm", config.color)}>
                                {config.icon}
                            </div>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">
                                {config.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Security Note */}
                <Collapsible className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="w-full flex items-center justify-between p-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 h-auto">
                            <span className="flex items-center gap-2 text-xs font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-500" />
                                Is my account safe?
                            </span>
                            <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3 text-xs text-zinc-500 dark:text-zinc-400 space-y-2 animate-in slide-in-from-top-2">
                        <p>
                            <strong className="text-zinc-700 dark:text-zinc-300">Bank-Grade Encryption:</strong> Your credentials are encrypted using AES-256 (IV) before being stored. Even we cannot see your password.
                        </p>
                        <p>
                            <strong className="text-zinc-700 dark:text-zinc-300">Privacy First:</strong> Our system only interacts with emails specifically tagged with our warmup headers. Your personal inbox remains private.
                        </p>
                        <p>
                            <strong className="text-zinc-700 dark:text-zinc-300">Total Control:</strong> You can disconnect your account and wipe your data from our servers instantly at any time.
                        </p>
                    </CollapsibleContent>
                </Collapsible>
            </div >
        )
    }

    const currentProvider = PROVIDERS[selectedProvider]

    // Step 2: Input Form
    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="mb-6 flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
                <ArrowLeft className="w-3 h-3 mr-1" /> Back to Providers
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-sm", currentProvider.color)}>
                    {currentProvider.icon}
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{currentProvider.name}</h3>
                    <p className="text-xs text-zinc-500">Enter your credentials below</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Step 1: Identity */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sender Name</FormLabel>
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
                                <FormLabel>{currentProvider.passwordLabel}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••••••" {...field} />
                                </FormControl>
                                {(currentProvider.helperText) && (
                                    <FormDescription className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 rounded-lg text-xs flex items-start gap-2 border border-blue-100 dark:border-blue-900/20">
                                        <span className="mt-0.5 shrink-0"><AlertCircle className="w-3.5 h-3.5" /></span>
                                        <span>
                                            {currentProvider.helperText}
                                            {currentProvider.helperLink && (
                                                <a
                                                    href={currentProvider.helperLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block mt-1 underline font-semibold hover:text-blue-800"
                                                >
                                                    Read Guide &rarr;
                                                </a>
                                            )}
                                        </span>
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Advanced Settings (Hidden for known providers usually) */}
                    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="w-full space-y-2 border rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                                Advanced Server Settings
                            </h4>
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-zinc-200/50">
                                    {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-4 pt-4 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className='space-y-3'>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Outgoing (SMTP)</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="smtpHost"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-xs">Host</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8 text-xs font-mono" {...field} />
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
                                                        <Input className="h-8 text-xs font-mono" inputMode="numeric" pattern="[0-9]*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Incoming (IMAP)</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="imapHost"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-xs">Host</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8 text-xs font-mono" {...field} />
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
                                                        <Input className="h-8 text-xs font-mono" inputMode="numeric" pattern="[0-9]*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Error Alert */}
                    {status === 'error' && (
                        <Alert variant="destructive" className="animate-in fade-in zoom-in-95">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Failed</AlertTitle>
                            <AlertDescription>
                                {errorMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Submit */}
                    <div className="pt-4  pb-2">
                        <Button type="submit" className="w-full transition-all duration-300 shadow-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {statusMessage}
                                </>
                            ) : (
                                `Connect ${currentProvider.name}`
                            )}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}
