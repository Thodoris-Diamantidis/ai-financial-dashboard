"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/UserContext";
import { DrawerDialog } from "../components/DrawerDialog";

export default function Profile() {
  const { user, setUser } = useUser();

  if (!user) {
    return (
      <div className="flex flex-col p-7">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    );
  }

  async function handleSave(updated: { name: string }) {
    //Call api
    const res = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update profile");

    // Update context immediately
    setUser({ ...user!, ...updated });
  }

  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="flex">
        <div>
          <Avatar className="rounded-lg w-32 h-32">
            <AvatarImage src={user.avatar} alt="profile picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col pl-7">
          <h1 className="text-4xl font-bold mb-1">Profile</h1>
          <span>{user.name}</span>
          <span className="text-stone-400">{user.email}</span>
          <DrawerDialog user={user} onSave={handleSave} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl">Favorite Cryptocurrencies</h2>
      </div>
    </div>
  );
}
