import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url, fallbackName = "User") {
  if (!url || url === "undefined" || url === "null") {
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fallbackName)}`;
  }
  if (url.startsWith("http")) return url;
  let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
  return `${apiUrl}${url}`;
}
