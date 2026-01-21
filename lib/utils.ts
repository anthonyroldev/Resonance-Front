import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retrieves the auth token from available sources.
 * Checks AUTH_TOKEN cookie (set by Google OAuth) first,
 * then falls back to localStorage token (set by email/password login).
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // Check AUTH_TOKEN cookie (from Google OAuth)
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "AUTH_TOKEN" && value) {
      return value;
    }
  }

  // Fallback to localStorage token (from email/password login)
  return localStorage.getItem("token");
}
