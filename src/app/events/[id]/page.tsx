import { getEventById } from "@/lib/posts/data";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function page({ params }: any) {
  const awaitedParams = await params;
  const res = await getEventById(awaitedParams.id);

  // Translations'dan title ve description al
  const title = res.translations?.tr?.title || res.title || "Etkinlik";
  const description =
    res.translations?.tr?.description || res.content?.html || "";
  const excerpt = res.translations?.tr?.excerpt || res.excerpt || "";

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {res.coverImage && (
        <Image
          width={1920}
          height={1080}
          src={res.coverImage}
          alt="Kapak"
          className="mb-4 rounded w-full max-h-[500px] object-cover"
        />
      )}
      <div className="mb-2 text-gray-600 text-sm">
        <span className="font-semibold">Başlangıç:</span>{" "}
        {res.startDate ? new Date(res.startDate).toLocaleString("tr-TR") : "-"}
      </div>
      {res.endDate && (
        <div className="mb-2 text-gray-600 text-sm">
          <span className="font-semibold">Bitiş:</span>{" "}
          {new Date(res.endDate).toLocaleString("tr-TR")}
        </div>
      )}
      {res.location && (
        <div className="mb-2 text-gray-600 text-sm">
          <span className="font-semibold">Konum:</span> {res.location}
        </div>
      )}
      <div className="mb-2 text-gray-600 text-sm">
        <span className="font-semibold">Durum:</span> {res.status}
      </div>
      <div className="mb-4 text-gray-700">
        <span className="font-semibold">Açıklama:</span> {excerpt}
      </div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <Link
        className="text-white rounded-xl w-1/2 bg-blue-800 p-2 text-center block mt-4"
        href={`/events/${res._id}/participants`}
      >
        Katılımcıları Görüntüle
      </Link>
    </div>
  );
}
