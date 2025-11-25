import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceCardsData } from "@/types/crypto";
import { useState, useEffect } from "react";
import { ArrowBigDown } from "lucide-react";

export default function PriceCards() {
  const [threeTopCurrencies, setThreeTopCurrencies] = useState<
    PriceCardsData[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch("/api/get-crypto");
        const data: PriceCardsData[] = await res.json();

        const formatData: PriceCardsData[] = (data as unknown[])
          .slice(0, 3)
          .map((coin) => {
            if (
              typeof coin === "object" &&
              coin !== null &&
              "id" in coin &&
              "symbol" in coin &&
              "current_price" in coin &&
              "name" in coin &&
              "change" in coin &&
              "image" in coin
            ) {
              return {
                id: coin.id as string,
                symbol: coin.symbol as string,
                name: coin.name as string,
                price: coin.current_price as number,
                change: `${(coin.change as number).toFixed(2)}%`,
                changeDirection: (coin.change as number) >= 0 ? "up" : "down",
                image: coin.image as string,
              };
            } else {
              throw new Error("Invalid API response structure");
            }
          });
        setThreeTopCurrencies(formatData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoins();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 px-5 pt-5 gap-4">
        {"123".split("").map((_, key) => (
          <Skeleton key={key} className="h-[85px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 px-5 pt-5">
      {threeTopCurrencies?.map((crypto: PriceCardsData, index: number) => (
        <Card key={index} className="shadow-none border-none p-4 w-full">
          <div className="flex gap-3">
            {/* IMAGE */}
            <img
              src={crypto.image}
              alt={crypto.name}
              className="h-11 w-11 object-contain rounded-md"
            />

            {/* RIGHT SIDE BLOCK */}
            <div className="flex flex-col justify-center">
              {/* NAME */}
              <p className="text-xs font-medium text-muted-foreground">
                {crypto.name}
              </p>

              {/* PRICE + ARROW (same row) */}
              <div className="flex items-center justify-between w-full">
                {/* PRICE */}
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(crypto.price)}
                </p>

                {/* ARROW + CHANGE */}
                <div
                  className={`flex items-center gap-1 ml-4 ${
                    crypto.changeDirection === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {crypto.changeDirection === "down" ? (
                    <ArrowBigDown className="text-xl" />
                  ) : (
                    <ArrowBigDown className="text-xl rotate-180" />
                  )}
                  <span className="text-sm">{crypto.change}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
