export const dynamic = "force-dynamic";

import UserGrid from "@/components/Users/UserGrid";
import { getAllUsers } from "@/lib/admin/data";
import React from "react";

export default async function page() {
  try {
    const res = await getAllUsers();
    // API response'unu kontrol et
    const users = res?.users || res || [];

    return (
      <div>
        <UserGrid users={Array.isArray(users) ? users : []} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return (
      <div>
        <UserGrid users={[]} />
      </div>
    );
  }
}
