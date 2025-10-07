/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type CartContextType = {
  cartCount: number;
  setCartCount: (count: number) => void; // bisa dipakai untuk override (mis. setelah login)
  incrementCart: (qty?: number) => void;
  decrementCart: (qty?: number) => void;
  syncCartFromServer: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_KEY = "cart_v2"; // simpan serverCount + pendingDelta

export function CartProvider({ children }: { children: React.ReactNode }) {
  // serverCount = nilai yang terakhir dikonfirmasi dari server
  const [serverCount, setServerCount] = useState<number>(0);
  // pendingDelta = perubahan lokal yang belum dikonfirmasi oleh server
  const [pendingDelta, setPendingDelta] = useState<number>(0);

  // timeout ref untuk debounce sync
  const syncTimer = useRef<number | null>(null);
  const isMounted = useRef(false);

  // derived cartCount yang dipakai aplikasi
  const cartCount = serverCount + pendingDelta;

  // helper: persist ke localStorage
  const persist = (sCount: number, pDelta: number) => {
    try {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ serverCount: sCount, pendingDelta: pDelta })
      );
    } catch (e) {
      // ignore
    }
  };

  // sync from server (fetch count only)
  const syncCartFromServer = async () => {
    try {
      const res = await fetch("/api/carts/get", { method: "GET" });
      if (!res.ok) throw new Error("Gagal ambil cart");
      const data = await res.json();
      const serverTotal = (data.items || []).reduce(
        (acc: number, it: any) => acc + (it.quantity || 0),
        0
      );

      // setelah mendapat nilai server, kita anggap server sudah memproses semua request
      // sehingga kita set serverCount ke nilai server dan reset pendingDelta
      setServerCount(serverTotal);
      setPendingDelta(0);
      persist(serverTotal, 0);
    } catch (err) {
      console.error("syncCartFromServer error:", err);
    }
  };

  // Debounced trigger untuk sinkronisasi
  const scheduleSync = (delay = 1200) => {
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
    }
    syncTimer.current = window.setTimeout(() => {
      syncCartFromServer();
      syncTimer.current = null;
    }, delay);
  };

  // optimistic increment
  const incrementCart = (qty = 1) => {
    setPendingDelta((prev) => {
      const updated = prev + qty;
      persist(serverCount, updated);
      return updated;
    });
    // schedule background sync (non-blocking UI)
    scheduleSync();
  };

  // optimistic decrement
  const decrementCart = (qty = 1) => {
    setPendingDelta((prev) => {
      const updated = Math.max(0, prev - qty);
      persist(serverCount, updated);
      return updated;
    });
    scheduleSync();
  };

  // allow external override (misal setelah login / manual set)
  const setCartCount = (count: number) => {
    // treat as authoritative server value
    setServerCount(count);
    setPendingDelta(0);
    persist(count, 0);
  };

  // on mount: try load cached state, then immediately sync with server
  useEffect(() => {
    isMounted.current = true;
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const s =
          typeof parsed.serverCount === "number" ? parsed.serverCount : 0;
        const p =
          typeof parsed.pendingDelta === "number" ? parsed.pendingDelta : 0;
        setServerCount(s);
        setPendingDelta(p);
      }
    } catch (e) {
      // ignore parse errors
    }

    // always try to reconcile with server after mount
    // small delay so UI shows instantly then reconciling won't block rendering
    const t = window.setTimeout(() => {
      syncCartFromServer();
    }, 300);
    return () => {
      clearTimeout(t);
      if (syncTimer.current) clearTimeout(syncTimer.current);
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist whenever serverCount or pendingDelta changes
  useEffect(() => {
    persist(serverCount, pendingDelta);
  }, [serverCount, pendingDelta]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        incrementCart,
        decrementCart,
        syncCartFromServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
