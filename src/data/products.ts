/* eslint-disable @typescript-eslint/no-explicit-any */
// src/data/products.ts

// 2. Perbarui tipe data Product untuk menyertakan 'colors' (opsional)
// src/data/products.ts

// ...
export type Product = {
  _id?: any; // ID dari MongoDB
  id: number | string; // ID yang kita gunakan di komponen
  name: string;
  price: number;
  stock?: number; // tambahkan ini
  categoryId?: string;
  image: string;
  description: string;
  colors?: { value: string; label: string }[];
};
// ... sisa file tetap sama

// 3. Ekspor array data produk dengan data 'colors' yang baru
export const products: Product[] = [
  {
    id: 1,
    name: "Exclusive Next.js Hoodie",
    price: 250000,
    image: "/hoodie.jpg",
    description:
      "Edisi terbatas, dibuat dengan bahan premium yang nyaman untuk coding semalaman.",
  },
  {
    id: 2,
    name: "React Developer Sticker",
    price: 25000,
    image: "/sticker.jpg",
    description:
      "Tunjukkan keahlian React Anda dengan stiker vinyl berkualitas tinggi ini.",
    // Produk ini mungkin tidak memiliki varian warna, jadi properti 'colors' bisa dikosongkan
  },
  {
    id: 3,
    name: "Mug Kopi Koding",
    price: 85000,
    image: "/mug.jpg",
    description: "Mug keramik yang sempurna untuk menemani sesi ngoding Anda.",
    colors: [
      { value: "hitam", label: "Hitam" },
      { value: "putih", label: "Putih" },
    ],
  },
];
