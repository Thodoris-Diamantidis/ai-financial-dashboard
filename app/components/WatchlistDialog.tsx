"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface WatchlistDialogProps {
  symbol: string;
  company: string;
  priceFormatted: string;
  changeFormatted: string;
  logo: string;
}
export default function WatchlistDialog({
  symbol,
  company,
  priceFormatted,
  changeFormatted,
  logo,
}: WatchlistDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [option, setOption] = useState<"eq" | "lt" | "gt">("eq");
  const [targetPrice, setTargetPrice] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) {
      alert("Please enter a target price");
      return;
    }

    //Call API route to save alert
    try {
      const res = await fetch("api/watchlist/add-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          company,
          priceFormatted,
          changeFormatted,
          logo,
          option,
          targetPrice,
        }),
      });

      if (!res.ok) throw new Error("Failed to save alert");

      toast.success("Alert added succesfully");
      router.refresh();
      setOpen(false); //close dialog
    } catch (err) {
      console.error(err);
      toast.error("Error saving alert");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        // Reset form when dialog closes
        if (!isOpen) {
          setOption("eq"); // default option
          setTargetPrice(""); // clear price input
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add Alert</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogDescription>
              Make changes to your alert.Click save when you&apos;re done
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="options">Option</Label>
              <Select
                name="options"
                value={option}
                onValueChange={(val) => setOption(val as "eq" | "lt" | "gt")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Options</SelectLabel>
                    <SelectItem value="eq">Equal to Price</SelectItem>
                    <SelectItem value="lt">Less than Price</SelectItem>
                    <SelectItem value="gt">Greater than Price</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                placeholder="Enter price"
              />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
