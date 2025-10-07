/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

export default function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("products");
    const cachedTime = localStorage.getItem("products_timestamp");

    // cek apakah cache masih valid (misalnya 1 jam)
    const isValid =
      cached &&
      cached !== "undefined" && // ⬅️ pastikan bukan string "undefined"
      cachedTime &&
      Date.now() - parseInt(cachedTime) < 1000 * 60 * 60;

    if (isValid) {
      try {
        setProducts(JSON.parse(cached));
      } catch (e) {
        console.warn("Cache JSON rusak, ambil ulang dari API:", e);
        localStorage.removeItem("products");
        localStorage.removeItem("products_timestamp");
      } finally {
        setLoading(false);
      }
    } else {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          // sesuaikan field dari API kamu, misal `data.products` atau `data.data`
          const items = data.products || data.data || [];
          setProducts(items);
          localStorage.setItem("products", JSON.stringify(items));
          localStorage.setItem("products_timestamp", Date.now().toString());
        })
        .catch((err) => {
          console.error("Fetch products gagal:", err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  return { products, loading };
}
