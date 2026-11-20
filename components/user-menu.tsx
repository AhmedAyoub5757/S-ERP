"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

export function UserMenu({ email, roles }: { email: string; roles: string[] }) {
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-11 gap-2 rounded-md px-2.5 hover:bg-muted" />}
      >
        <Avatar className="h-8 w-8 rounded-md">
          <AvatarFallback className="rounded-md bg-primary/10 text-xs font-semibold text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden max-w-48 flex-col items-start text-left sm:flex">
          <span className="truncate text-xs font-semibold">{email}</span>
          <span className="text-[10px] capitalize text-muted-foreground">{roles.join(" · ").replace(/_/g, " ")}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-lg">
        <DropdownMenuLabel>
          <div className="flex items-start gap-3 px-1 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{email}</span>
              <span className="mt-0.5 text-xs capitalize text-muted-foreground">
              {roles.join(", ").replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
