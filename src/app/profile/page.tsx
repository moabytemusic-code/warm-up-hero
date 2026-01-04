import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Mail, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/components/profile/settings-form"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch subscription status from public.users table if needed, 
    // but we can start with basic auth user data for now.
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-orange-600 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Profile Settings
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            Manage your account information and preferences.
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                <User className="w-8 h-8 text-zinc-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Personal Information</CardTitle>
                                <CardDescription>Your identification details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid gap-6">

                        {/* Email */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-sm">
                                {user.email}
                            </div>
                        </div>

                        {/* User ID */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" /> User ID
                            </label>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-500">
                                {user.id}
                            </div>
                        </div>

                        {/* Joined Date */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Joined On
                            </label>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm">
                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </div>

                        {/* Subscription */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Current Plan
                            </label>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${profile?.subscription_status === 'free' ? 'bg-zinc-200 text-zinc-800' :
                                            'bg-gradient-to-r from-orange-400/20 to-red-500/20 text-orange-700 border border-orange-200'}`}>
                                        {profile?.subscription_status || 'Free Plan'}
                                    </span>
                                </div>
                                <Link href="/billing">
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Manage Subscription
                                    </Button>
                                </Link>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <SettingsForm />

            </div>
        </main>
    )
}
