import { inngest } from "@/lib/ingest/client";
import {
  favoriteStocksAI,
  sendDailyNewsSummary,
  sendPriceAlerts,
  sendSignUpEmail,
} from "@/lib/ingest/functions";
import { serve } from "inngest/next";

//Exposing our inngest functions via a next.js API route which will make this functions callable
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendSignUpEmail,
    sendDailyNewsSummary,
    sendPriceAlerts,
    favoriteStocksAI,
  ],
});
