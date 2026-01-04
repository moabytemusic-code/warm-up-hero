import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, PlusCircle, LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { ConnectAccountForm } from '@/components/dashboard/connect-account-form'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DebugActions } from '@/components/dashboard/debug-actions'
import { AccountList } from '@/components/dashboard/account-list'
import { HowItWorks } from '@/components/dashboard/how-it-works'
import { UserNav } from '@/components/dashboard/user-nav'
import { getDashboardStats, getConnectedAccounts } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = await createClient();
    const [stats, accounts, { data: { user } }] = await Promise.all([
        getDashboardStats(),
        getConnectedAccounts(),
        supabase.auth.getUser()
    ]);

    const hasAccounts = accounts.length > 0;

    // ----------------------------------------------------------------------
    // FOCUSED ONBOARDING MODE (New User / No Accounts)
    // ----------------------------------------------------------------------
    if (!hasAccounts) {
        return (
            <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans bg-grid-pattern relative overflow-x-hidden flex flex-col">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Simplified Header (Logo Only) */}
                <header className="w-full p-6 flex justify-center relative z-10">
                    <div className="flex items-center gap-2.5 group cursor-default opacity-80 hover:opacity-100 transition-opacity">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-orange-500/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600" />
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">W</div>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">WarmUpHero</span>
                    </div>
                </header>

                {/* Centered Wizard */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 -mt-20">
                    <div className="text-center mb-8 max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">WarmUpHero</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                            Let's get your first email account connected and warming up in seconds.
                        </p>
                    </div>

                    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="glass rounded-xl shadow-2xl shadow-orange-500/5 border border-white/20 dark:border-white/10">
                            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
                            <div className="p-6 md:p-8 bg-white/50 dark:bg-black/40 backdrop-blur-xl">
                                <ConnectAccountForm />
                            </div>
                        </div>
                        <p className="text-center text-xs text-zinc-400 mt-6 max-w-xs mx-auto">
                            By connecting, you agree to our terms of service. We only access emails related to the warmup process.
                        </p>
                    </div>
                </div>
            </main>
        )
    }

    // ----------------------------------------------------------------------
    // STANDARD DASHBOARD MODE (Returning User)
    // ----------------------------------------------------------------------
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans bg-grid-pattern relative overflow-x-hidden">

            {/* Decorative gradient blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation / Header */}
            <nav className="border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group cursor-default">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600" />
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">W</div>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">WarmUpHero</span>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        <HowItWorks />
                        <Link href="/billing">
                            <Button variant="outline" size="sm" className="hidden md:flex border-orange-200/50 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-300 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all duration-300 shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Upgrade Plan
                            </Button>
                        </Link>
                        <form action={signOut}>
                            <Button variant="ghost" size="sm" className="hidden md:flex text-zinc-500 hover:text-red-600 dark:hover:text-red-400">
                                <LogOut className="w-4 h-4 mr-2" />
                                Exit
                            </Button>
                        </form>
                        <UserNav email={user?.email || 'User'} />
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6 space-y-10 relative z-10">

                {/* Dashboard Overview */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h2>
                        <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-full border border-black/5 dark:border-white/5">
                            Last updated just now
                        </span>
                    </div>
                    <DashboardOverview stats={stats} />
                </section>

                {/* Developer Tools (Visible for easy testing) */}
                <section>
                    <DebugActions />
                </section>

                {/* Accounts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Col: Accounts List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Accounts</h2>
                        </div>

                        <AccountList accounts={accounts} />
                    </div>

                    {/* Right Col: Connect Form */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                Add Another Account
                            </h2>
                        </div>
                        <div className="glass rounded-xl shadow-xl shadow-black/5">
                            {/* Decorative top strip */}
                            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
                            <div className="p-6">
                                <ConnectAccountForm />
                            </div>
                        </div>


                    </div>

                </section>
            </div>
        </main>
    )
}
