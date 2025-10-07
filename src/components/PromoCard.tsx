"use client";

import Image from "next/image";

type PromoCardProps = {
  title: string;
  subtitle?: string;
  image: string;
};

export default function PromoCard({ title, subtitle, image }: PromoCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-md">
      <Image
        src={image}
        alt={title}
        width={400}
        height={200}
        className="object-cover w-full h-96"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
