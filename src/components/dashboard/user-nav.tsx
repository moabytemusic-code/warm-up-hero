'use client'

import React from 'react'
import Link from 'next/link'
import { LogOut, User, CheckCircle2, CreditCard } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/auth/actions'

interface UserNavProps {
    email: string;
}

export function UserNav({ email }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                            {email}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-transparent group-hover:border-amber-500/20 overflow-hidden transition-all">
                        <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${email}`}
                            alt="User"
                            className="w-full h-full bg-white dark:bg-black"
                        />
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">{email}</p>
                        <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
                            WarmUp Network Member
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                <DropdownMenuGroup>
                    <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/billing">
                        <DropdownMenuItem className="cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/10 focus:text-red-600"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
