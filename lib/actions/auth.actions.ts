//maybe user server

import { SignUpFormData } from "@/types/global";
import { inngest } from "../ingest/client";

export const signUpWithEmail = async ({
  email,
  password,
  name,
}: SignUpFormData) => {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });
    const dataFromFetch = await res.json();

    if (res) {
      await inngest.send({
        name: "app/user.created",
        data: { email, name },
      });
    }

    return { success: true, data: res };
  } catch (e) {
    console.log("Sign up failed", e);
    return { success: false, error: "Sign up failed" };
  }
};
