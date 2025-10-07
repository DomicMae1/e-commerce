// src/models/User.ts
import clientPromise from "@/lib/mongodb";

export async function getUserCollection() {
  const client = await clientPromise;
  const db = client.db("e-commerce"); // gunakan DB default dari connection string
  return db.collection("users");
}
