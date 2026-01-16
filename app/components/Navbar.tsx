"use client";

import { ThemeToggle } from "./ThemeToggle.";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import UserMenu from "./UserMenu";
import SearchCommand from "./SearchCommand";
import { StockWithWatchlistStatus } from "@/types/global";
import Image from "next/image";

export default function Navbar({
  initialStocks,
}: {
  initialStocks: StockWithWatchlistStatus[];
}) {
  const router = useRouter();
  const { user, loading, setUser } = useUser();

  // Logout handler
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <nav
      className="flex h-[73px] items-center justify-between px-6
  backdrop-blur-sm sticky z-50 top-0 border-b border-primary/60"
    >
      {/* Left: Project Name */}
      {/* <h1 className="hover:cursor-pointer" onClick={() => router.push("/")}>
        Powered Financial Dashboard
      </h1> */}
      <div className="hover:cursor-pointer flex flex-center">
        <Image
          src="/logo.png"
          alt="StockApp logo"
          width={130}
          height={30}
          onClick={() => router.push("/")}
        ></Image>
      </div>
      <div className="flex items-center gap-4">
        {!loading && (
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <SearchCommand
                renderAs="text"
                label="Search"
                initialStocks={initialStocks}
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
