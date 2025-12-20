import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { ConnectAccountForm } from '@/components/dashboard/connect-account-form'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DebugActions } from '@/components/dashboard/debug-actions'
import { getDashboardStats } from '@/app/actions'

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
              WarmUpHero
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Supercharge your email deliverability with AI-powered warmups.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/billing">
              <Button variant="outline" className="border-orange-200 hover:bg-orange-50 text-orange-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </header>

        {/* Dynamic Dashboard Overview */}
        <section>
          <DashboardOverview stats={stats} />
        </section>

        {/* Connect Action Area */}
        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">Connect New Account</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConnectAccountForm />
            <div className="space-y-6">
              {/* Instructions or other secondary content could go here */}
              <DebugActions />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
