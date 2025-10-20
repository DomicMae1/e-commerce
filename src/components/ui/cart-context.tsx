"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 1. Perbaiki tipe CartItem: Hapus 'qty' & tambahkan properti opsional agar konsisten
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // Opsional, tapi penting untuk ditampilkan di halaman keranjang
  location?: string; // Opsional
};

// 2. Lengkapi CartContextType dengan semua fungsi yang ada
type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.id === item.id);
      if (exist) {
        // Jika item sudah ada, tambah kuantitasnya
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      // Jika item baru, tambahkan ke keranjang
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setCart([]);

  // 3. Tambahkan tipe pada parameter fungsi updateQuantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart((currentCart) => {
      // Jika kuantitas baru 0 atau kurang, hapus item dari keranjang
      if (newQuantity <= 0) {
        return currentCart.filter((item) => item.id !== productId);
      }
      // Jika tidak, perbarui kuantitas item yang cocok
      return currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // 4. Definisikan objek 'value' di luar JSX return statement
  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
  };

  return (
    // 5. Berikan objek 'value' ke prop 'value' dari Provider
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
