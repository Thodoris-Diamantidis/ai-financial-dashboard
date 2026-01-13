"use client";
import PriceCards from "./components/Price-Cards";
import { CryptoChart } from "./components/Crypto-Chart";
import TradingViewWidget from "./components/TradingViewWidget";
import {
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className={`p-2 min-h-screen`}>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] mt-4">
        <div className="w-full">
          <h3 className="font-semibold text-2xl  mb-5">Crypto Overview</h3>
          <PriceCards />
          <CryptoChart />

          <TradingViewWidget
            title="Timeline"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
            config={TOP_STORIES_WIDGET_CONFIG}
          />
        </div>
        <div>
          <TradingViewWidget
            title="Market Overview"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
          />
        </div>
      </div>
    </div>
  );
}
