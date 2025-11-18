"use client";

import { ThemeToggle } from "./ThemeToggle.";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Track current route
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user if not already in context
  useEffect(() => {
    if (!user) {
      async function fetchUser() {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, setUser]);

  // Close dropdown whenever route changes
  // useEffect(() => {
  //   setOpen(false);
  // }, [pathname]);

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
      <div className="flex items-center justify-between gap-4 w-[30%]">
        {!loading && (
          <div className="flex items-center w-full gap-4">
            <div className="flex items-center gap-4">
              <div className="relative grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
                <Input
                  type="search"
                  placeholder="Search a stock/coin..."
                  className="pl-8 border-none shadow-none w-full"
                />
              </div>
              <ThemeToggle />
            </div>

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
