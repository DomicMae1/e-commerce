export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
      <p className="text-gray-600">
        Kamu tidak memiliki izin untuk mengakses halaman ini.
      </p>
    </div>
  );
}
