import EditEvent from "@/components/Events/EditEvent";
import { getEventById } from "@/lib/posts/data";
import React from "react";

type Props = { params: { id: string } };

export default async function page({ params }: Props) {
  const awaitedParams = await params;
  const res = await getEventById(awaitedParams.id);
  return (
    <div>
      <EditEvent res={res} />
    </div>
  );
}
