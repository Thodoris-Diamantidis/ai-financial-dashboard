"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/UserContext";
import { DrawerDialog } from "../components/DrawerDialog";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

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

      <div
        className="grid  grid-cols-1 
                  md:grid-cols-[35vw_35vw] 
                  lg:grid-cols-[30vw_30vw]  mt-5 gap-7"
      >
        {/* Account Overview Section */}
        <Card className="p-5 rounded-lg ">
          <h2 className="text-2xl font-bold">Account Overview</h2>
          <div className="flex justify-between mt-3">
            <div>Member Since</div>
            <div>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <div className="flex justify-between">
            <div>Subscription</div>
            <div>{user.subscription?.toUpperCase()}</div>
          </div>
          <div className="flex justify-between ">
            <div>Last Login</div>
            <div className="text-red-400">Not Available</div>
          </div>
          <div className="flex justify-between ">
            <div>Security Status</div>
            <div className="flex items-center ">
              <Check size={16} className="text-green-500" />
              <span>All good</span>
            </div>
          </div>
        </Card>

        {/* Subscription Section */}
        <Card className="p-5 rounded-lg ">
          <h2 className="text-2xl font-bold">Subscription</h2>
        </Card>
      </div>
    </div>
  );
}
