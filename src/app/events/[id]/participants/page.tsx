import { getEventsParticipants } from "@/lib/posts/data";
import { getPostById } from "@/lib/posts/data";
import React from "react";
import AgGridParticipants from "../../../../components/AgGridParticipants";

type Props = {
  params: {
    id: string;
  };
};

export default async function page({ params }: Props) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const participants = await getEventsParticipants(id);
  const event = await getPostById(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {event?.title} - Katılımcı Listesi
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {event?.eventDate
            ? `Etkinlik tarihi: ${new Date(event.eventDate).toLocaleDateString(
                "tr-TR"
              )}`
            : ""}
        </p>
      </div>

      <AgGridParticipants participants={participants} />
    </div>
  );
}
