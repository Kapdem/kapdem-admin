import { publicSubmitList } from "@/lib/posts/data";
import React from "react";
import AgGridPublicSubmits from "../../components/PublicSubmit/AgGridPublicSubmits";
import Link from "next/link";

type Props = {};

export default async function Page({}: Props) {
  const submits = await publicSubmitList();

  return (
    <div className="p-4 md:p-8">
      <AgGridPublicSubmits submits={submits} />
    </div>
  );
}
