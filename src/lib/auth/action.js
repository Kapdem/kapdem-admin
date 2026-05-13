"use server";

import { fetchInstance } from "@/utils/fetch";
import { cookies } from "next/headers";

export const login = async (username, password) => {
  const response = await fetchInstance("/auth/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response) {
    throw new Error("Login failed");
  }

  const data = await response;

  // Save accessToken to cookies if it exists
  if (data && data.accessToken) {
    const cookieStore = await cookies();
    if (cookieStore && typeof cookieStore.set === "function") {
      cookieStore.set({
        name: "Authentication",
        value: `Bearer ${data.accessToken}`,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }
  }

  return data;
};

export const refresh = async () => {
  const response = await fetchInstance("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Refresh token failed");
  }

  return response.json();
};

export const logout = async () => {
  const cookieStore = await cookies();
  try {
    // Cookie silme (geçmiş expire vererek)
    cookieStore.set({
      name: "Authentication",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  } catch (e) {
    console.error("Logout cookie clear error", e);
  }
  return { success: true };
};
