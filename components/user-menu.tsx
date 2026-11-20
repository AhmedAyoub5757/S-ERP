'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth/actions'
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  User,
  GraduationCap,
} from 'lucide-react'

export function UserMenu({ email, roles }: { email: string; roles: string[] }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : 'GW'
  const primaryRole = roles[0] ? roles[0].replace(/_/g, ' ') : 'Member'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2.5 rounded-lg px-2 hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
        }
      >
        <Avatar className="h-8 w-8 rounded-lg border border-border">
          <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden max-w-[140px] flex-col items-start text-left sm:flex xl:max-w-[180px]">
          <span className="truncate text-xs font-semibold text-foreground">{email}</span>
          <span className="text-[10px] capitalize text-muted-foreground truncate">{primaryRole}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5 shadow-lg border-border">
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 rounded-lg border border-border">
              <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-foreground">{email}</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {roles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium capitalize text-muted-foreground"
                  >
                    <ShieldCheck className="h-2.5 w-2.5 text-primary" />
                    {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/dashboard" />}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Dashboard Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <form action={logout}>
          <button
            type="submit"
            className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
