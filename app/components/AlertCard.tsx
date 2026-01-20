"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAlert } from "@/lib/actions/alertserver.actions";
import { AlertlistProps } from "@/types/global";
import { Edit2, Trash2 } from "lucide-react";
import WatchlistDialog from "./WatchlistDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AlertCard({ alertlist }: AlertlistProps) {
  if (!alertlist || alertlist.length === 0) return <div>No alerts set</div>;

  const handleDelete = async (alertId: string) => {
    await deleteAlert(alertId);
  };

  return (
    <div className="flex flex-col gap-4 w-[350px] p-2">
      {alertlist.map((alert) => (
        <Card key={alert._id}>
          <CardHeader className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2">
              {alert.logo && (
                <img
                  src={alert.logo}
                  alt={alert.symbol}
                  className="w-8 h-8 rounded-full"
                />
              )}

              <div className="flex flex-col">
                <CardTitle className="text-sm font-semibold">
                  {alert.company}
                </CardTitle>

                <span className="text-xs text-gray-400">
                  {alert.priceFormatted}
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              <WatchlistDialog
                symbol={alert.symbol}
                company={alert.company}
                priceFormatted={alert.priceFormatted ?? ""}
                changeFormatted={alert.changeFormatted ?? ""}
                logo={alert.logo ?? ""}
                alertToEdit={{
                  _id: alert._id,
                  option: alert.option ?? "eq", // default to "eq" if undefined
                  targetPrice: alert.targetPrice ?? 0, // default to 0 if undefined
                }}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(alert._id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="text-sm flex flex-col gap-1">
            <div>Symbol: {alert.symbol}</div>
            <div>
              Alert:{" "}
              {alert.option === "eq" ? "=" : alert.option === "lt" ? "<" : ">"}{" "}
              ${alert.targetPrice}
            </div>
            {/* {alert.frequency && (
              <div className="text-xs text-gray-400">{alert.frequency}</div>
            )}
            {alert.currentPrice && <div>Current: {alert.currentPrice}</div>} */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
