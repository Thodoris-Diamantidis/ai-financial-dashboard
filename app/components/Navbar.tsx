"use client";

import { ThemeToggle } from "./ThemeToggle.";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, setUser } = useUser();

  // Logout handler
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <nav className="flex h-[73px] items-center justify-between px-6">
      {/* Left: Project Name */}
      <h1 className="hover:cursor-pointer" onClick={() => router.push("/")}>
        Powered Financial Dashboard
      </h1>
      <div className="flex items-center gap-4">
        {!loading && (
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
              <Input
                type="search"
                placeholder="Search a stock/coin..."
                className=" pl-8 border-none shadow-none w-32 sm:w-48 md:w-64 lg:w-72"
              />
            </div>
            <ThemeToggle />

            {/* Spacer pushes UserMenu to the right */}
            <div className="ml-auto">
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
