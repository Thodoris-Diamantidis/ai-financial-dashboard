"use client";
import PriceCards from "./components/Price-Cards";
import { CryptoChart } from "./components/Crypto-Chart";

export default function Home() {
  return (
    <div className={`p-2 min-h-screen`}>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] mt-4">
        <div className="w-full">
          <PriceCards />
          <CryptoChart />
        </div>
      </div>
    </div>
  );
}
