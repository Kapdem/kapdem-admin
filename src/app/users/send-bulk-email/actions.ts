"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function fetchUsersAction() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("Authentication");

  if (!authCookie) {
    throw new Error("Authentication cookie not found");
  }

  const response = await fetch(`${BASE_URL}/admin/users`, {
    headers: {
      Authorization: authCookie.value,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data = await response.json();
  return data.users || [];
}

export async function sendBulkEmailAction(
  subject: string,
  html: string,
  userIds: string[],
) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("Authentication");

  if (!authCookie) {
    throw new Error("Authentication cookie not found");
  }

  const response = await fetch(`${BASE_URL}/admin/users/send-bulk-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authCookie.value,
    },
    credentials: "include",
    body: JSON.stringify({
      subject,
      html,
      userIds,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send emails: ${error}`);
  }

  return await response.json();
}

export async function fetchNewslettersAction() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("Authentication");

  if (!authCookie) {
    throw new Error("Authentication cookie not found");
  }

  const response = await fetch(`${BASE_URL}/newsletter/all`, {
    headers: {
      Authorization: authCookie.value,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch newsletters: ${response.status}`);
  }

  return await response.json();
}

export async function sendBulkNewsletterEmailAction(
  subject: string,
  html: string,
) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("Authentication");

  if (!authCookie) {
    throw new Error("Authentication cookie not found");
  }

  const response = await fetch(`${BASE_URL}/admin/newsletter/send-bulk-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authCookie.value,
    },
    credentials: "include",
    body: JSON.stringify({
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send emails: ${error}`);
  }

  return await response.json();
}
