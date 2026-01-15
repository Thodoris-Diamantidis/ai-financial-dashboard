"use server";

import { cache } from "react";
import { getCurrentUserFromServer } from "./auth";

export const getUserWatchlist = cache(async (): Promise<string[]> => {
  try {
    const user = await getCurrentUserFromServer();
    return user?.favorites || [];
  } catch (err) {
    console.error("Error fethcing user watchlist", err);
    return [];
  }
});
