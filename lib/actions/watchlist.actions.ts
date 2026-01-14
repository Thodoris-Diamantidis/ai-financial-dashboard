export async function addToWatchlist(symbol: string, company: string) {
  const res = await fetch("/api/watchlist/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, company }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to add to watchlist");
}

export async function removeFromWatchlist(symbol: string) {
  const res = await fetch("/api/watchlist/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove from watchlist");
}
