"use server";

import { cache } from "react";
import { getCurrentUserFromServer } from "./auth";
import { getStocksDetails } from "./actions/finnhub.actions";

export const getUserWatchlist = cache(async (): Promise<string[]> => {
  try {
    const user = await getCurrentUserFromServer();
    return user?.favorites || [];
  } catch (err) {
    console.error("Error fethcing user watchlist", err);
    return [];
  }
});

export const getWatchlistWithData = async () => {
  try {
    const user = await getCurrentUserFromServer();

    const watchlist: string[] = user?.favorites;

    if (watchlist.length === 0) return [];

    const stocksWithData = await Promise.all(
      watchlist.map(async (symbol) => {
        const stockData = await getStocksDetails(symbol);

        if (!stockData) {
          console.warn(`Failed to fetch data for ${symbol}`);
          return {
            userId: user?.id || "unknown",
            company: "Unknown Company",
            symbol: symbol,
            currentPrice: 0,
            priceFormatted: "—",
            changeFormatted: "—",
            changePercent: 0,
            marketCap: "0",
            peRatio: "—",
          }; // fallback object
        }
        return {
          company: stockData.company,
          symbol: stockData.symbol,
          currentPrice: stockData.currentPrice,
          priceFormatted: stockData.priceFormatted,
          changeFormatted: stockData.changeFormatted,
          changePercent: stockData.changePercent,
          marketCap: stockData.marketCapFormatted,
          peRatio: stockData.peRatio,
        };
      })
    );
    return stocksWithData;
  } catch (error) {
    console.error("Error loading watchlist:", error);
    throw new Error("Failed to fetch watchlist");
  }
};
