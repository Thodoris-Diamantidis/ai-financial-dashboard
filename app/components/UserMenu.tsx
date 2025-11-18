"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  user: any;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/login")}>
          Login
        </Button>
        <Button variant="outline" onClick={() => router.push("/register")}>
          Register
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <UserCircle className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Manage Favorites</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
