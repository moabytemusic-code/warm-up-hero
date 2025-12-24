'use client'

import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, ShieldCheck, Mail, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/app/actions';

interface CustomTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
    label?: string;
}

// Custom Tooltip for Line Chart
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl text-xs">
                <p className="font-semibold mb-1">{label}</p>
                <p className="text-blue-500">Sent: {payload[0].payload.sent}</p>
                <p className="text-green-500">Inbox Rate: {payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

interface OverviewProps {
    stats: DashboardStats;
}

export function DashboardOverview({ stats }: OverviewProps) {

    // Color Logic for Health Score
    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const healthColor = getHealthColor(stats.healthScore);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Health Score */}
                <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">Domain Health</CardTitle>
                        <Activity className={`w-4 h-4 ${healthColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20">
                                {/* Simple SVG Gauge */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-zinc-100 dark:text-zinc-800"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className={`${healthColor} transition-all duration-1000 ease-out`}
                                        strokeDasharray={`${stats.healthScore}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className={`text-xl font-bold ${healthColor}`}>{stats.healthScore}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Inbox Placement</p>
                                <p className="text-xs text-zinc-400 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Reliable
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Daily Volume */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">Daily Volume</CardTitle>
                        <Mail className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dailyVolume} <span className="text-zinc-400 text-base font-normal">/ {stats.dailyLimit}</span></div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (stats.dailyVolume / stats.dailyLimit) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">Emails sent today</p>
                    </CardContent>
                </Card>

                {/* 3. Rescue Count */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-zinc-500">Rescued from Spam</CardTitle>
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rescueCount}</div>
                        <p className="text-xs text-zinc-400 mt-1">Total emails moved to Inbox</p>
                        <div className="flex items-center mt-3 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Reputation Improving
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Row: Graphic + Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Reputation Graph */}
                <Card className="lg:col-span-2 min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Reputation History</CardTitle>
                        <p className="text-sm text-zinc-500">Inbox placement rate over the last 14 days.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.graphData}>
                                    <defs>
                                        <linearGradient id="colorInbox" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#71717A' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#71717A' }}
                                        domain={[0, 100]}
                                        unit="%"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="inboxRate"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorInbox)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Live Feed */}
                <Card className="max-h-[400px] overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Activity</CardTitle>
                        <p className="text-sm text-zinc-500">Real-time network actions.</p>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {stats.feed.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 text-sm pb-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                    <div className={`mt-1 p-1.5 rounded-full ${item.type === 'SENT' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {item.type === 'SENT' ? <Mail className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                    </div>
                                    <div>
                                        <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                                            {item.message}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">{item.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
