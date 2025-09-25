// Definisikan tipe data untuk produk
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

// Ekspor array data produk
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
  },
  {
    id: 3,
    name: "Mug Kopi Koding",
    price: 85000,
    image: "/mug.jpg",
    description: "Mug keramik yang sempurna untuk menemani sesi ngoding Anda.",
  },
];
