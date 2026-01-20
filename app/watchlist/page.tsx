import { Star } from "lucide-react";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import SearchCommand from "../components/SearchCommand";
import { getAlertsWithData, getWatchlistWithData } from "@/lib/user";
import { WatchlistTable } from "../components/WatchlistTable";
import AlertCard from "../components/AlertCard";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_QUESTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import AskAI from "../components/AskAI";

const Watchlist = async () => {
  const watchlist = await getWatchlistWithData();
  const alertlist = await getAlertsWithData();
  const initialStocks = await searchStocks();
  //Empty state
  if (watchlist.length === 0) {
    return (
      <section className="flex container gap-8 flex-col items-center md:mt-10 p-6 text-center">
        <div className="flex flex-col items-center justify-center text-center">
          <Star className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2"></h2>
          <p className="mb-6 max-w-md">
            Start building your watchlist by searching for stocks and clicking
            the star icon
          </p>
        </div>
        <SearchCommand initialStocks={initialStocks} />
      </section>
    );
  }

  return (
    <section className="w-full px-6 m-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Watchlist – 2/3 */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">Watchlist</h2>
              <SearchCommand initialStocks={initialStocks} />
            </div>

            <WatchlistTable watchlist={watchlist} />
          </div>
          <div className="flex items-center justify-center">
            <span className="mr-5">Ask AI:</span>
            <AskAI watchlist={watchlist} />
          </div>
        </section>

        {/* Alerts – 1/3 */}
        <section className="lg:col-span-1">
          <AlertCard alertlist={alertlist} />
        </section>
      </div>
    </section>
  );
};

export default Watchlist;
