"use client";

import { useEffect, useState } from "react";
import { Coin } from "../types/crypto";

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch("/api/get-crypto");
        const data: Coin[] = await res.json();
        setCoins(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoins();
  }, []);

  if (loading) return <div>Loading......</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Top 100 Crypto Coins</h1>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Symbol</th>
            <th className="border px-2 py-1">Price (USD)</th>
            <th className="border px-2 py-1">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, index) => (
            <tr key={coin.id}>
              <td className="border px-2 py-1">{index + 1}</td>
              <td className="border px-2 py-1">{coin.name}</td>
              <td className="border px-2 py-1">{coin.symbol.toUpperCase()}</td>
              <td className="border px-2 py-1">
                ${coin.current_price.toLocaleString()}
              </td>
              <td className="border px-2 py-1">
                ${coin.market_cap.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
