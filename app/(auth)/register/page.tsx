"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    try {
      e.preventDefault();

      const result = await signUpWithEmail({ email, password, name });
      if (result.success) router.push("/login");
    } catch (err) {
      console.log(err);
      toast.error("Sign-Up failed", {
        description:
          err instanceof Error ? err.message : "Failed to create an account",
      });
    }

    // const res = await fetch("/api/auth/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, password, name }),
    // });
    // const data = await res.json();
    // if (!res.ok) {
    //   setError(data.error || "Error");
    // } else {
    //   router.push("/login");
    // }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register a Account</CardTitle>
          <CardDescription>
            Fill the inputs and create a Account
          </CardDescription>
          <CardAction>
            <Button variant="link">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="George Russell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                ></Input>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="xxx@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                ></Input>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                ></Input>
                {error && <p className="text-red-500 mb-2">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-8">
            <Button type="submit" className="w-full">
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
