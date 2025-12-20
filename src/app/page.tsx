import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, PlusCircle } from 'lucide-react'
import { ConnectAccountForm } from '@/components/dashboard/connect-account-form'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DebugActions } from '@/components/dashboard/debug-actions'
import { AccountList } from '@/components/dashboard/account-list'
import { HowItWorks } from '@/components/dashboard/how-it-works'
import { getDashboardStats, getConnectedAccounts } from '@/app/actions'

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [stats, accounts] = await Promise.all([
    getDashboardStats(),
    getConnectedAccounts()
  ]);

  const hasAccounts = accounts.length > 0;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans bg-grid-pattern relative overflow-x-hidden">

      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation / Header */}
      <nav className="border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">W</div>
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">WarmUpHero</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <HowItWorks />
            <Link href="/billing">
              <Button variant="outline" size="sm" className="hidden md:flex border-orange-200/50 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-300 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all duration-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden ring-2 ring-transparent hover:ring-orange-500/20 transition-all cursor-pointer">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=KD`} alt="User" className="w-full h-full" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-10 relative z-10">

        {/* Welcome Section (Only if no accounts) */}
        {!hasAccounts && (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 drop-shadow-sm">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">WarmUpHero</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Connect your email accounts to start warming them up automatically. Increase your deliverability and stop landing in spam.
            </p>
          </div>
        )}

        {/* Dashboard Overview */}
        {hasAccounts && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Overview</h2>
              <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-full border border-black/5 dark:border-white/5">
                Last updated just now
              </span>
            </div>
            <DashboardOverview stats={stats} />
          </section>
        )}

        {/* Accounts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Col: Accounts List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Accounts</h2>
            </div>

            {hasAccounts ? (
              <AccountList accounts={accounts} />
            ) : (
              // Empty State Card
              <div className="relative group overflow-hidden rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 p-12 text-center space-y-4 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No accounts connected</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
                    Connect your first email account using the form to join the network and boost your reputation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Connect Form */}
          <div className="space-y-6 sticky top-24">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {hasAccounts ? 'Add Another Account' : 'Connect Account'}
              </h2>
            </div>
            <div className="glass rounded-xl shadow-xl shadow-black/5 overflow-hidden">
              {/* Decorative top strip */}
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
              <div className="p-6">
                <ConnectAccountForm />
              </div>
            </div>

            {/* Debug Actions (Hidden behind details for cleanliness) */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 select-none transition-colors px-1">
                <span>Developer Tools</span>
              </summary>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                <DebugActions />
              </div>
            </details>
          </div>

        </section>
      </div>
    </main>
  )
}
