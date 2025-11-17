"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/lib/UserContext";

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
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Logout handler
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow px-4 py-2 flex justify-between items-center">
      {/* Left: Project Name */}
      <div
        className="text-xl font-bold cursor-pointer text-gray-900 dark:text-white"
        onClick={() => router.push("/")}
      >
        AI-Powered Financial Dashboard
      </div>

      {/* Right: User actions */}
      {!loading && (
        <div className="relative">
          {user ? (
            <>
              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setOpen(!open)}
              >
                <UserCircleIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-md rounded-md z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      router.push("/settings");
                      setOpen(false);
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      router.push("/favorites");
                      setOpen(false);
                    }}
                  >
                    Manage Favorites
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-4">
              <button
                className="text-gray-900 dark:text-white hover:underline"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
              <button
                className="text-gray-900 dark:text-white hover:underline"
                onClick={() => router.push("/register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
