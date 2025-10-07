// src/context/LikesContext.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type LikesContextType = {
  likesCount: number;
  likedIds: string[];
  isLoading: boolean;
  error: any;
  mutateLikes: () => void;
  setLikesCount: (count: number) => void;
};

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/likes", fetcher, {
    revalidateOnFocus: true,
  });

  const [likesCount, setLikesCount] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    if (data?.items) {
      setLikesCount(data.items.length);
      setLikedIds(data.items.map((item: any) => String(item._id)));
    }
  }, [data]);

  return (
    <LikesContext.Provider
      value={{
        likesCount,
        likedIds,
        isLoading,
        error,
        mutateLikes: mutate,
        setLikesCount,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error("useLikes harus digunakan di dalam LikesProvider");
  }
  return context;
}
