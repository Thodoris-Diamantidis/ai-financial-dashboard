"use client";

import { Button } from "@/components/ui/button";
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
import { WatchlistTableProps } from "@/types/global";
import { useEffect, useState } from "react";

export default function AskAI({ watchlist }: WatchlistTableProps) {
  const [symbol, setSymbol] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [answer, setAnswer] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!symbol || !question) return;

    setLoading(true);
    setAnswer(null);

    await fetch("api/watchlist/favorite-stock-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: watchlist[0].userId,
        symbol,
        questionType: question,
      }),
    });

    // Poll for result every 1.5s until it's available
    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/get-latest-ai-results?userId=${watchlist[0].userId}&symbol=${symbol}&questionType=${question}`,
      );
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
        clearInterval(interval);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Select onValueChange={setSymbol}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select one stock/coin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Coin/Stock</SelectLabel>
              {watchlist.map((item, index) => (
                <SelectItem key={item.symbol + index} value={item.symbol}>
                  {item.symbol}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select onValueChange={setQuestion}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select question" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>AI QUESTION</SelectLabel>
              {AI_QUESTIONS.map((item, index) => (
                <SelectItem key={item.title + index} value={item.title}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button onClick={handleAsk} disabled={loading}>
          {loading ? "Asking..." : "Ask"}
        </Button>
        <div className="mt-4 p-4 border rounded">
          {loading && !answer && <p>Thinking...</p>}
          {(answer && <p>{answer}</p>) || "No more api credits"}
        </div>
      </div>
    </div>
  );
}
