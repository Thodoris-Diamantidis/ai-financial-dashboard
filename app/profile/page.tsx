"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/UserContext";

export default function Profile() {
  const { user } = useUser();

  if (!user) {
    console.log("No user logged in");
    return (
      <div className="flex flex-col p-7">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    );
  }
  console.log("Avatar URL:", user.avatar);
  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="flex">
        <div>
          <Avatar className="rounded-lg w-32 h-32">
            <AvatarImage src={user.avatar} alt="profile picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col pl-7 text-start">
          <h1 className="text-4xl font-bold">Profile</h1>
          <span>{user.name}</span>
          <span className="text-stone-400">{user.email}</span>
          <Button className="text-blue-500" variant="link">
            Edit profile
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl">Favorite Cryptocurrencies</h2>
      </div>
    </div>
  );
}
