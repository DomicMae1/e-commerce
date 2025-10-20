"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

export default function OrderSteps({ orderId }: { orderId: string }) {
  const pathname = usePathname();

  // Hapus query dan trailing slash agar path bersih
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");

  // Ambil orderId langsung dari URL
  const idFromUrl = cleanPath.split("/")[2];
  const id = orderId || idFromUrl;

  const steps = [
    { name: "Order", path: `/order/${id}` },
    { name: "Konfirmasi", path: `/order/${id}/konfirmasi` },
    { name: "Pembayaran", path: `/order/${id}/payment` },
  ];

  const currentIndex = steps.findIndex((s) => cleanPath === s.path);

  return (
    <div className="flex justify-center items-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isActive = cleanPath === step.path;
        const isCompleted = currentIndex > index;

        return (
          <div key={step.name} className="flex items-center">
            {/* Lingkaran step */}
            <div
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold transition-colors",
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : isCompleted
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-200 text-gray-500 border-gray-300"
              )}
            >
              {index + 1}
            </div>

            {/* Nama step */}
            <div className="ml-2 px-4">
              <Link
                href={step.path}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-green-500"
                    : "text-gray-500"
                )}
              >
                {step.name}
              </Link>
            </div>

            {/* Garis penghubung */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  "w-12 h-[2px] mx-6 transition-colors",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
