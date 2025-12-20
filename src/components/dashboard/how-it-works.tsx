'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CircleHelp, Users, Mail, ShieldCheck, TrendingUp } from "lucide-react"

export function HowItWorks() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <CircleHelp className="h-5 w-5" />
                    <span className="sr-only">How it works</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">How WarmUpHero Works</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Our automated peer-to-peer network improves your sender reputation in 4 simple steps.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Step 1 */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">1. Join the Network</h3>
                            <p className="text-sm text-zinc-500 mt-1">Connect your email account to join our safe, private pool of real inboxes.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">2. Smart Conversations</h3>
                            <p className="text-sm text-zinc-500 mt-1">Our AI generates natural, human-like email threads between accounts in the network.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">3. Spam Rescue</h3>
                            <p className="text-sm text-zinc-500 mt-1">If your email lands in spam, we automatically find it, mark it as important, and move it to the inbox.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">4. Reputation Boost</h3>
                            <p className="text-sm text-zinc-500 mt-1">These positive signals tell Gmail and Outlook that you are a trusted sender, boosting your open rates.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
