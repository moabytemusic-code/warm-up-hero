'use client'

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
    const supabase = createClient()
    const router = useRouter()
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                router.replace('/dashboard')
                router.refresh() // Force server re-check/data fetch
            }
        })

        return () => subscription.unsubscribe()
    }, [router, supabase])

    if (!mounted) return null

    return (
        <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                        W
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Sign in to WarmUpHero
                </h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    Boost your email deliverability today.
                </p>
            </div>

            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-8 rounded-xl shadow-xl shadow-black/5 border border-white/20 dark:border-white/10">
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#f97316', // Orange-500
                                    brandAccent: '#ea580c', // Orange-600
                                },
                            },
                        },
                        className: {
                            button: 'bg-orange-500 hover:bg-orange-600 border-none text-white',
                            input: 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 focus:border-orange-500',
                            container: 'gap-4'
                        }
                    }}
                    providers={[]}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                    theme={theme === 'dark' ? 'dark' : 'default'}
                />
            </div>
        </div>
    )
}
