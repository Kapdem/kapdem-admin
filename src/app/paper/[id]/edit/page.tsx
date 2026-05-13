import React from "react";
import { getPostById } from "@/lib/posts/data";
import EditPaper from "@/components/Paper/EditPaper";
import { availableAuthors } from "@/lib/admin/data";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params }: Props) {
  const awaitedParams = await params;
  const data = await getPostById(awaitedParams.id);

  const res = await availableAuthors();

  return (
    <div>
      <EditPaper data={data} authors={res.authors} />
    </div>
  );
}
