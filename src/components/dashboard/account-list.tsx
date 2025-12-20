'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Zap, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailAccount } from '@/app/actions';

interface AccountListProps {
    accounts: EmailAccount[];
}

export function AccountList({ accounts }: AccountListProps) {
    if (accounts.length === 0) return null;

    return (
        <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Connected Accounts</span>
                    <span className="text-xs font-normal text-zinc-500">{accounts.length} active</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <div key={account.id} className="group flex items-center justify-between p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{account.email_address}</p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                        <span className="flex items-center">
                                            <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                                            Limit: {account.daily_limit}/day
                                        </span>
                                        <span>•</span>
                                        <span>Score: {account.current_warmup_score || 0}/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Status Indicator */}
                                <div className="flex items-center px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                                    Active
                                </div>

                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
