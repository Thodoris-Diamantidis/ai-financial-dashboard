import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function DrawerDialog({
  user,
  onSave,
}: {
  user: any;
  onSave: (updated: { name: string; avatar?: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const profileForm = <ProfileForm name={user.name} onSave={onSave} />;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="text-blue-500" variant="link">
            Edit profile
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[445px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you &apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          {profileForm}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="text-blue-500" variant="link">
          Edit profile
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        {profileForm}
        <DrawerFooter className="pt2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface ProfileFormProps {
  name: string;
  onSave: (updated: { name: string }) => Promise<void>;
  className?: string;
}

function ProfileForm({
  name: initialName,
  onSave,
  className,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ name });
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6">
      <div className="grid gap-3">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={name} // bind state
          onChange={(e) => setName(e.target.value)}
          placeholder="@shadcn"
        />
      </div>
      <Button type="submit">{loading ? "Saving..." : "Save changes"}</Button>
    </form>
  );
}
