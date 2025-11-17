"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error");
    } else {
      router.push("/login");
    }
  }

  return (
    <form onSubmit={submit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <button type="submit">Register</button>
      {error && <p>{error}</p>}
    </form>
  );
}
