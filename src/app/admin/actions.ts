'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminUser = {
    id: string
    email: string | null
    subscription_status: string | null
    created_at: string
}

export type AdminStats = {
    totalUsers: number
    activeSubscriptions: number
    totalRevenue: number // Mocked for now
}

export async function authorizeAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    // TODO: Replace with your actual admin email(s) or a role check
    const ALLOWED_ADMINS = ['kd5000@example.com', 'admin@warmuphero.com', 'kdsing@gmail.com'] // Add your email here to test

    // Check if email is allowed OR if they have a specific flag in public.users
    if (ALLOWED_ADMINS.includes(user.email || '')) {
        return true
    }

    // Optional: Check database role
    // const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    // return profile?.role === 'admin'

    return true // TEMPORARY: Allow all logged in users for the demo. PLEASE CHANGE THIS BEFORE PROD.
}

export async function getAdminStats(): Promise<AdminStats> {
    const isAdmin = await authorizeAdmin()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    // Get total users
    const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

    // Get active subs (simple count of non-free)
    const { count: activeSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_status', 'free')

    // Mock revenue calc
    const estimatedRev = (activeSubscriptions || 0) * 29

    return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue: estimatedRev
    }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
    const isAdmin = await authorizeAdmin()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, subscription_status, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return users as AdminUser[]
}

export async function updateUserPlan(userId: string, newPlan: string) {
    const isAdmin = await authorizeAdmin()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
        .from('users')
        .update({ subscription_status: newPlan })
        .eq('id', userId)

    if (error) throw new Error('Failed to update plan')

    revalidatePath('/admin')
    return { success: true }
}
