// 🔑 Role-based access map
type RoleAccessMap = Record<string, string[]>;

export const roleAccess: RoleAccessMap = {
  admin: ["/", "/produk", "/produk/admin", "/keranjang", "/user", "/settings", "/wishlist"],
  user: ["/", "/produk", "/keranjang", "/user", "/wishlist"],
};

// 🧭 Normalisasi path (hapus trailing slash)
function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

// 🧩 Fungsi pengecekan akses
export function canAccess(role: string, path: string): boolean {
  const allowedPaths = roleAccess[role];
  if (!allowedPaths) return false;

  const normalizedPath = normalizePath(path);

  return allowedPaths.some((allowed) => {
    const normalizedAllowed = normalizePath(allowed);

    if (normalizedPath === normalizedAllowed) return true;
    if (normalizedPath.startsWith(`${normalizedAllowed}/`)) {
      // Blokir user biasa dari folder admin
      if (role === "user" && normalizedPath.includes("/admin")) {
        return false;
      }
      return true;
    }

    return false;
  });
}