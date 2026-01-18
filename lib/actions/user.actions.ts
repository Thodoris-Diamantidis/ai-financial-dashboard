"use server";

import clientPromise from "../mongodb";

export const getAllUsersForNewsEmail = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("ai_finance");

    const users = await db
      .collection("users")
      .find(
        // email thats exists and its not null
        { email: { $exists: true, $ne: null } },
        // The fields to return in the query

        //1/18 added alerts to make work of priceAlerts
        { projection: { _id: 1, email: 1, name: 1, alerts: 1 } },
      )
      .toArray();

    return users
      .filter((user) => user.email && user.name)
      .map((user) => ({
        id: user._id || "",
        email: user.email,
        name: user.name,
        alerts: user.alerts,
      }));
  } catch (err) {
    console.error("Error fetching users for news email:", err);
    return [];
  }
};
