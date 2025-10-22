/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID order tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("e-commerce");
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID order tidak valid" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("e-commerce");

    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updated_at: new Date().toISOString() } }
      );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Error updating order" },
      { status: 500 }
    );
  }
}
