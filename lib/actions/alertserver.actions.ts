"use server";

import { ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { revalidatePath } from "next/cache";

export async function deleteAlert(alertId: string) {
  const client = await clientPromise;
  const db = client.db("ai_finance");

  await db
    .collection("users")
    .updateOne({ "alerts._id": new ObjectId(alertId) }, {
      $pull: { alerts: { _id: new ObjectId(alertId) } },
    } as any);

  // Optional: revalidate pages that show alerts
  revalidatePath("/watchlist", "page");
  revalidatePath("/", "layout");
}
