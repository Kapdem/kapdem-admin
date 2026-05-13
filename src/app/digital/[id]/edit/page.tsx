import EditDigital from "@/components/Digital/EditDigital";
import { getPostById } from "@/lib/posts/data";
import React from "react";

type Props = { params: { id: string } };

export default async function page({ params }: Props) {
  const awaitedParams = await params;
  const res = await getPostById(awaitedParams.id);

  return (
    <div>
      <EditDigital post={res} />
    </div>
  );
}
