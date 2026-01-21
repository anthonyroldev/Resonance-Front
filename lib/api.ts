import { Media } from "./types";

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

export async function fetchUserProfile(token: string): Promise<any> {
  const response = await fetch(`${BASE_API_URL}/library`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch user profile");
  }
  return response.json();
}

export async function getDiscoveryFeed(token: string): Promise<Media[]> {
  if (!token){
      const response = await fetch(`${BASE_API_URL}/public/feed`, {
        method: "GET",
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to fetch discovery feed");
      }
      return response.json();
  }
  const response = await fetch(`${BASE_API_URL}/public/feed`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch discovery feed");
  }
  return response.json();
}
