// src/data/products.ts

// 1. Definisikan tipe untuk varian warna
type ColorOption = {
  value: string;
  label: string;
};

// 2. Perbarui tipe data Product untuk menyertakan 'colors' (opsional)
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  colors?: ColorOption[]; // '?' berarti properti ini tidak wajib ada di setiap produk
};

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
