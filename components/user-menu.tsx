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
import { LogOut } from "lucide-react";

export function UserMenu({ email, roles }: { email: string; roles: string[] }) {
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="flex items-center gap-2" />}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{email}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {roles.join(", ").replace(/_/g, " ")}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
