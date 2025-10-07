import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/models/User";

// 🔹 Update user by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const usersCollection = await getUserCollection();
    const body = await req.json();

    const { id } = params;
    const updatedUser = {
      name: body.name,
      email: body.email,
      role: body.role,
      updatedAt: new Date(),
    };

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan atau tidak berubah." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate user." },
      { status: 500 }
    );
  }
}
