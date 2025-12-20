
import { getAdminStats, getAdminUsers, authorizeAdmin } from './actions'
import { redirect } from 'next/navigation'
import { UserRowActions } from '@/components/admin/user-row-actions'
import Link from 'next/link'
import { ArrowLeft, Users, CreditCard, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const isAllowed = await authorizeAdmin()
    if (!isAllowed) {
        redirect('/dashboard')
    }

    const [stats, users] = await Promise.all([
        getAdminStats(),
        getAdminUsers()
    ])

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Admin Dashboard</h1>
                        <p className="text-zinc-500">Manage users and subscriptions</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                            ADMIN MODE
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-500">Total Users</h3>
                            <Users className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalUsers}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-500">Active Subscriptions</h3>
                            <CreditCard className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.activeSubscriptions}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-zinc-500">Est. Monthly Revenue</h3>
                            <DollarSign className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">${stats.totalRevenue}</div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">All Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Email / ID</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3">Subscription</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.email || 'No Email'}</div>
                                            <div className="text-xs text-zinc-500 font-mono mt-1">{user.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${user.subscription_status === 'free' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' :
                                                    user.subscription_status === 'agency' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                {user.subscription_status || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <UserRowActions userId={user.id} currentPlan={user.subscription_status || 'free'} />
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    )
}
