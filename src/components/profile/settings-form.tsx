'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Loader2, Moon, Sun, Monitor, Lock } from 'lucide-react'

export function SettingsForm() {
    const { theme, setTheme } = useTheme()
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Password updated successfully')
                setPassword('')
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="space-y-6">
            {/* Theme Settings */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-zinc-500" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize how WarmUpHero looks on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Tabs value={theme} onValueChange={setTheme} className="w-full max-w-sm">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="light" className="flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> Light
                                </TabsTrigger>
                                <TabsTrigger value="dark" className="flex items-center gap-2">
                                    <Moon className="w-4 h-4" /> Dark
                                </TabsTrigger>
                                <TabsTrigger value="system" className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4" /> System
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Password Settings */}
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-zinc-500" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="bg-zinc-50 dark:bg-zinc-950"
                            />
                        </div>
                        <Button type="submit" disabled={loading || !password}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
