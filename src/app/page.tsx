
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Shield, Zap, Mail } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans bg-grid-pattern relative overflow-x-hidden flex flex-col">

      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">W</div>
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">WarmUpHero</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="#features" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</Link>
            <Link href="#login" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">How it works</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-lg shadow-orange-600/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32">
        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 text-center lg:py-24 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            New: Automated smart warming is live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Stop landing in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Spam</span>. <br />
            Start hitting the Inbox.
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            WarmUpHero automatically improves your email deliverability using a peer-to-peer network of real inboxes. Recover your reputation in days, not months.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-semibold shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20">
                Start Warming for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-zinc-500 mt-4 sm:mt-0">No credit card required</p>
          </div>

          {/* Stats / Social Proof */}
          <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="space-y-1">
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">99%</h4>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Inbox Rate</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">10k+</h4>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Real Inboxes</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">24/7</h4>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Auto-Warming</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">0%</h4>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Effort</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-y border-zinc-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">Everything you need to fix your reputation</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">We replicate human behavior to signal trust to email providers like Gmail, Outlook, and Yahoo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Mail className="w-8 h-8 text-blue-500" />,
                  title: "Smart Conversations",
                  desc: "Our AI generates realistic email threads between your account and our network, mimicking real business communication."
                },
                {
                  icon: <Shield className="w-8 h-8 text-green-500" />,
                  title: "Spam Rescue",
                  desc: "When your emails land in spam, our agents automatically find them, mark them as 'Not Spam', and move them to the inbox."
                },
                {
                  icon: <Zap className="w-8 h-8 text-orange-500" />,
                  title: "Reputation Monitoring",
                  desc: "Track your domain health score in real-time. Know exactly when you are ready to launch your cold outreach campaigns."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-black p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-8">Ready to fix your email deliverability?</h2>
            <Link href="/login">
              <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90 transition-opacity shadow-2xl shadow-orange-500/30 border-none">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-black text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2024 WarmUpHero. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-200">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-200">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
