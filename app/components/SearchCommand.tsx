"use client";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { SearchCommandProps, StockWithWatchlistStatus } from "@/types/crypto";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import WatchlistButton from "./WatchlistButton";
import { useUser } from "@/lib/UserContext";

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
}: SearchCommandProps) {
  const { user: currentUser } = useUser();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  const [watchlistMap, setWatchlistMap] = useState<Record<string, boolean>>({});
  // Populate the map whenever initialStocks change
  useEffect(() => {
    const map: Record<string, boolean> = {};
    initialStocks.forEach((s) => {
      map[s.symbol] = s.isInWatchlist;
    });
    setWatchlistMap(map);
    setStocks(initialStocks);
  }, [initialStocks]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);
    setLoading(true);
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 400);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  //If the user closes the Search with escape remove any filters
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setStocks(initialStocks);
    }
  }, [open]);

  return (
    <>
      {renderAs === "text" ? (
        <span onClick={() => setOpen(true)}>{label}</span>
      ) : (
        <Button onClick={() => setOpen(true)}>{label}</Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={searchTerm}
          onValueChange={setSearchTerm}
          placeholder="Search stocks..."
        />
        <CommandList>
          {loading ? (
            <CommandEmpty>Loading stocks...</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="px-5 py-2">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <ul>
              <div className="py-2 px-4 text-sm font-medium">
                {isSearchMode ? "Search results" : "Popular stocks"}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock, i) => (
                <li
                  key={`${stock.symbol}-${i}`} //Unique key now
                  className="rounded-none my-3 px-1 w-full data-[selected=true]:bg-gray-600"
                >
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="px-2 w-full cursor-pointer flex items-center gap-3"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium text-base">{stock.name}</div>
                    </div>
                    <div className="text-sm">
                      {stock.symbol} | {stock.exchange} | {stock.type}
                    </div>
                    {currentUser && (
                      <WatchlistButton
                        symbol={stock.symbol}
                        company={stock.name}
                        isInWatchlist={
                          watchlistMap[stock.symbol] ?? stock.isInWatchlist
                        }
                        type="icon"
                        onChange={(newState: boolean) => {
                          setWatchlistMap((prev) => ({
                            ...prev,
                            [stock.symbol]: newState,
                          }));
                        }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
