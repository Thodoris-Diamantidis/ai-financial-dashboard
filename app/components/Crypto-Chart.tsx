import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { chartData, CryptoComboBox } from "@/types/crypto";
import { useEffect, useState } from "react";
import { CoinCombobox } from "./Coin-Combobox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CryptoChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [value, setValue] = useState<string>("");
  const [formattedPrice, setFormattedPrice] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [comboBoxCoins, setComboBoxCoins] = useState<CryptoComboBox[]>([]);
  const selectedCoin = comboBoxCoins?.find((coin) => coin.value === value);

  const [chartData, setChartData] = useState<chartData[]>([]);

  function aggregateByDay(data: [number, number][], days: number) {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    // Filter only last N days
    const filtered = data.filter(([timestamp]) => timestamp >= cutoff);

    // Group by day
    const grouped: { [day: string]: number[] } = {};
    filtered.forEach(([timestamp, price]) => {
      const day = new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(price);
    });

    // Take average for each day (or pick last point)
    const chartData = Object.entries(grouped).map(([date, prices]) => ({
      date,
      price: Number(prices[prices.length - 1].toFixed(2)), // last price of the day
      // or use average: prices.reduce((a,b)=>a+b,0)/prices.length
    }));

    return chartData;
  }

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch("/api/get-crypto");
        const data = await res.json();

        const formattedData: CryptoComboBox[] = (data as unknown[])
          .map((crypto: unknown) => {
            if (
              typeof crypto === "object" &&
              crypto !== null &&
              "id" in crypto &&
              "name" in crypto &&
              "image" in crypto &&
              "current_price" in crypto &&
              "change" in crypto
            ) {
              return {
                value: crypto.id as string,
                label: crypto.name as string,
                icon: crypto.image as string,
                price: String(crypto.current_price),
                change:
                  crypto.change != null
                    ? (crypto.change as number).toFixed(4)[0] !== "-"
                      ? `+${(crypto.change as number).toFixed(4)}`
                      : (crypto.change as number).toFixed(4)
                    : "0.0000",
              };
            } else {
              return null; //return null from invalid entries
            }
          })
          .filter((item): item is CryptoComboBox => item !== null);
        setComboBoxCoins(formattedData);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoins();
  }, []);

  //Automatically select the first coin when data is available
  useEffect(() => {
    if (comboBoxCoins && comboBoxCoins.length > 0 && !value) {
      setValue(comboBoxCoins[0].value); //set the first coin's value
    }
  }, [comboBoxCoins, value]);

  //Update formattedPrice whenever the selected coin's value changes
  useEffect(() => {
    if (value) {
      if (selectedCoin) {
        const numericCoinPrice = parseFloat(selectedCoin.price);
        const formattedPrice = numericCoinPrice.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
        setFormattedPrice(formattedPrice);
      }
    }
  }, [value, comboBoxCoins]);

  function onChangeToggleGroup(item: string) {
    setSelectedPeriod(item);
  }

  useEffect(() => {
    async function fetchPrices() {
      if (selectedCoin?.value) {
        console.log("fetching chart for:", selectedCoin?.value);
        const res = await fetch(`/api/get-crypto-chart/${selectedCoin.value}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Error loading chart:", data.error);
          return;
        }
        const prices: [number, number][] = data.prices;

        const filteredPrices = aggregateByDay(
          prices,
          selectedPeriod === "7D" ? 7 : selectedPeriod === "15D" ? 15 : 30
        );

        setChartData(filteredPrices);
      }
    }
    fetchPrices();
  }, [selectedCoin, selectedPeriod]);

  return (
    <Card className="col-span-4 m-5 border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">
          <CoinCombobox
            coins={comboBoxCoins}
            isLoading={loading}
            isError={error}
            value={value}
            setValue={setValue}
          />

          <div className="mt-4">
            <span className="text-2xl font-bold">{formattedPrice}</span>
            <span
              className={`ml-2 text-sm ${
                selectedCoin?.change[0] === "-"
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {selectedCoin?.change}
            </span>
          </div>
        </CardTitle>
        <div className="flex gap-2">
          <ToggleGroup
            value={selectedPeriod}
            onValueChange={onChangeToggleGroup}
            type="single"
          >
            {["7D", "15D", "30D"].map((period, key) => (
              <ToggleGroupItem key={key} value={`${period}`}>
                {period}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {" "}
        {loading ? (
          <div className="h-[230px]">
            <Skeleton className="h-full w-full"></Skeleton>
          </div>
        ) : (
          <div className="h-[230px] mt-5">
            <ResponsiveContainer
              className={"text-[12px]"}
              width="100%"
              height={280}
            >
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.705 0.213 47.604)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.705 0.213 47.604)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={0} // force all labels to show
                  angle={-45} // optional: tilt if labels overlap
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorWords)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
