// src/app/api/user/route.ts
import { NextResponse } from "next/server";
import { getUserCollection } from "@/models/User";

export async function GET() {
  try {
    const usersCollection = await getUserCollection();
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const usersCollection = await getUserCollection();
    const body = await req.json();

    const newUser = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newUser },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah user" },
      { status: 500 }
    );
  }
}
