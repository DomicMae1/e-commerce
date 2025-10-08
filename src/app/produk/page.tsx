"use client";

import ProdukListClient from "./ProdukListClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <div className="w-full min-h-screen px-4 py-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Semua Produk</h1>
        <ProdukListClient />
      </div>
    </Suspense>
  );
}
