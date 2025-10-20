// src/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="container mx-auto px-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Deskripsi */}
        <div className="col-span-2">
          <h2 className="text-4xl font-bold text-white">Toko Koding</h2>
          <p className="mt-4 text-sm text-gray-400">
            Tempat terbaik untuk mendapatkan merchandise developer favoritmu 🎉
          </p>

          <h3 className="text-lg font-semibold text-white pt-6">Kontak</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>Email: support@tokokoding.com</li>
            <li>Telp: +62 812-3456-7890</li>
            <li>Alamat: Jakarta, Indonesia</li>
          </ul>
        </div>

        {/* Navigasi */}
        <div className="col-span-1 pl-8">
          <h3 className="text-lg font-semibold text-white">Navigasi</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/produk" className="hover:text-white transition">
                Produk
              </Link>
            </li>
            <li>
              <Link href="/keranjang" className="hover:text-white transition">
                Keranjang
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white transition">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Kontak */}
        <div className="col-span-2 flex justify-center">
          {/* Ikon Bank dan Pembayaran */}
          <div className="space-y-4 mb-6">
            {/* Baris 1 */}
            <div className="flex items-center flex-wrap gap-4">
              <Image
                src="/bca.png"
                alt="BCA"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/bni.png"
                alt="BNI"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/mandiri.png"
                alt="Mandiri"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/bri.png"
                alt="BRI"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/bsi.png"
                alt="BSI"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
            </div>

            {/* Baris 2 */}
            <div className="flex items-center flex-wrap gap-4">
              <Image
                src="/cimb_niaga.png"
                alt="CIMB Niaga"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/danamon.png"
                alt="Danamon"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/gopay.png"
                alt="GoPay"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/qris.png"
                alt="QRIS"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/spay.png"
                alt="ShopeePay"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
            </div>

            {/* Baris 3 */}
            <div className="flex items-center flex-wrap gap-4">
              <Image
                src="/spay_later.png"
                alt="ShopeePay Later"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/dana.png"
                alt="Dana"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/ovo.png"
                alt="OVO"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/visa.png"
                alt="Visa"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/mastercard.png"
                alt="MasterCard"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
            </div>

            {/* Baris 4 */}
            <div className="flex items-center flex-wrap gap-4">
              <Image
                src="/indomaret.png"
                alt="Indomaret"
                width={60}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/alfamart.png"
                alt="Alfamart"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
              <Image
                src="/gpay.png"
                alt="Gpay"
                width={50}
                height={30}
                className="h-6 w-auto rounded-sm bg-white p-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Toko Koding. All rights reserved.
      </div>
    </footer>
  );
}
