"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { cn, getChangeColorClass } from "@/lib/utils";
import { useRouter } from "next/navigation";
import WatchlistButton from "./WatchlistButton";
import { WatchlistTableProps } from "@/types/global";

export function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const router = useRouter();

  return (
    <>
      <Table className="scrollbar-hide-default relative! overflow-hidden w-full! rounded-lg!">
        <TableHeader>
          <TableRow className="font-medium border-b border-primary bg-gray-50d0 hover:bg-gray-700">
            {WATCHLIST_TABLE_HEADER.map((label) => (
              <TableHead className="table-header" key={label}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((item, index) => (
            <TableRow
              key={item.symbol + index}
              className="border-b cursor-pointer border-gray-600 hover:border-primary transition-colors"
              onClick={() =>
                router.push(`/stocks/${encodeURIComponent(item.symbol)}`)
              }
            >
              <TableCell className="pl-4 font-medium text-base">
                {item.company}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.symbol}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.priceFormatted || "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "font-medium text-base",
                  getChangeColorClass(item.changePercent)
                )}
              >
                {item.changeFormatted || "—"}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.marketCap || "—"}
              </TableCell>
              <TableCell className="font-medium text-base">
                {item.peRatio || "—"}
              </TableCell>
              <TableCell>
                <Button className="flex text-sm items-center whitespace-nowrap gap-1.5 px-3 w-fit py-2 text-primary border border-primary/20 rounded font-medium bg-transparent hover:bg-primary hover:text-white cursor-pointer transition-colors;">
                  Add Alert
                </Button>
              </TableCell>
              <TableCell>
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={true}
                  type="icon"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
