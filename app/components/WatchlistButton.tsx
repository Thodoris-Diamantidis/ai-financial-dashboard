"use client";

import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";
import { Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type WatchlistButtonProps = {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  type?: "button" | "icon";
  showTrashIcon?: boolean;
  onChange?: (next: boolean) => void;
};

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist,
  type = "icon",
  showTrashIcon = false,
  onChange,
}: WatchlistButtonProps) {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastIntent = useRef<boolean>(isInWatchlist);

  useEffect(() => {
    setAdded(isInWatchlist);
    lastIntent.current = isInWatchlist;
  }, [isInWatchlist]);

  const commit = useCallback(
    async (next: boolean) => {
      try {
        if (next) {
          await addToWatchlist(symbol, company);
          toast.success(`${symbol} added to watchlist`);
        } else {
          await removeFromWatchlist(symbol);
          toast.success(`${symbol} removed from watchlist`);
        }

        onChange?.(next);
      } catch {
        setAdded(lastIntent.current);
        toast.error("Something went wrong");
      }
    },
    [symbol, company]
  );

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const next = !added;
    setAdded(next);
    lastIntent.current = next;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commit(next), 300);
  };

  const Icon = showTrashIcon && added ? Trash2 : Star;

  if (type === "icon") {
    return (
      <button
        onClick={toggle}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition"
      >
        <Icon
          className="h-4 w-4"
          stroke={added ? "none" : "currentColor"} // remove outline if added
          fill={added ? "yellow" : "none"} // fill yellow if added
        />
      </button>
    );
  }

  return (
    <button
      className={`w-full h-11 rounded font-semibold cursor-pointer flex items-center justify-center gap-2 text-base transition-colors ${
        added
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-yellow-500 hover:bg-yellow-600 text-black"
      }`}
      onClick={toggle}
    >
      {showTrashIcon && added ? <Trash2 /> : null}
      <span>{added ? "Remove from Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
}
