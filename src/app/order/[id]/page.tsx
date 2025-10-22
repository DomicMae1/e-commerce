/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import ShipmentClient from "./ShipmentClient";

interface Order {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  items: any[];
  status: string;
  created_at: string;
}

async function getOrderById(id: string): Promise<Order | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/orders/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error(
        `Failed to fetch order with id: ${id}, Status: ${res.status}`
      );
      return null;
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default async function OrderPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <ShipmentClient order={order} />;
}
