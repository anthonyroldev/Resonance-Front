import { Media, PaginatedResponse, UserLibraryEntry } from "./types";

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}

export async function login(data: any): Promise<LoginResponse> {
  const response = await fetch(`${BASE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Login failed");
  }

  return response.json();
}

export async function register(data: any): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Registration failed");
  }

  return response.json();
}

export async function fetchUserLibrary(token: string): Promise<UserLibraryEntry[]> {
  const response = await fetch(`${BASE_API_URL}/library`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch user library");
  }
  return response.json();
}

export async function fetchUserFavorites(token: string): Promise<UserLibraryEntry[]> {
  const response = await fetch(`${BASE_API_URL}/library/favorites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch user favorites");
  }
  return response.json();
}

export async function getDiscoveryFeed(
  token: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<Media>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const url = `${BASE_API_URL}/public/feed?${params}`;

  if (!token || token === "") {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Failed to fetch discovery feed");
    }
    return response.json();
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch discovery feed");
  }
  return response.json();
}

export async function addToFavorites(
  token: string,
  mediaId: string
): Promise<void> {
  const response = await fetch(`${BASE_API_URL}/library/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mediaId: mediaId }),
  });

  if (!response.ok && response.status !== 201) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to add to favorites");
  }
}

export async function removeFromFavorites(
  token: string,
  mediaId: string
): Promise<void> {
  const response = await fetch(`${BASE_API_URL}/library/favorites/${mediaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to remove from favorites");
  }
}
