export function formatPKR(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!isFinite(n)) return "PKR 0";
  return "PKR " + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

export function resolveImage(url: string | null | undefined): string {
  if (!url) return "";
  // Map DB-seeded "/src/assets/..." paths to Vite-served asset URLs.
  if (url.startsWith("/src/assets/")) {
    const name = url.replace("/src/assets/", "");
    return new URL(`../assets/${name}`, import.meta.url).href;
  }
  return url;
}
