import EditorsGrid from "@/components/Editors/EditorsGrid";
import { getEditorsData } from "@/lib/admin/data";
import React from "react";

export default async function page() {
  const res = await getEditorsData();

  return (
    <div>
      <EditorsGrid editors={res} />
    </div>
  );
}
