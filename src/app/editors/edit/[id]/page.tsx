import EditEditor from "@/components/Editors/EditEditor";
import { getEditorById } from "@/lib/admin/action";
import React from "react";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params }: Props) {
  const { id } = await params;
  const res = await getEditorById(id);
  return (
    <div>
      <EditEditor res={res} />
    </div>
  );
}
