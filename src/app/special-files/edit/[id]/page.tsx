import React from "react";
import { getSpecialFileById } from "@/lib/special-files/data";
import EditSpecialFile from "@/components/SpecialFiles/EditSpecialFile";
import { availableAuthors } from "@/lib/admin/data";

type Props = {
  params: {
    id: string;
  };
};

export default async function EditSpecialFilePage({ params }: Props) {
  const awaitedParams = await params;
  const data = await getSpecialFileById(awaitedParams.id);
  const res = await availableAuthors();

  return (
    <div>
      <EditSpecialFile data={data} authors={res.authors} />
    </div>
  );
}
