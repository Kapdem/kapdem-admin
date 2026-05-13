import { getPostById } from "@/lib/posts/data";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = { params: { id: string } };

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function page({ params }: Props) {
  const awaitedParams = await params;
  const res = await getPostById(awaitedParams.id);

  return (
    <main className="max-w-7xl mx-auto mt-8 px-2 md:px-0">
      {/* Kapak görseli */}
      {res.coverImage && (
        <Image
          width={1920}
          height={1080}
          src={res.coverImage}
          alt={res.title}
          className="w-full max-h-96 object-cover mb-6"
        />
      )}
      {/* Başlık */}
      <h1 className="text-4xl font-bold mb-2 leading-tight">{res.title}</h1>
      {/* Yazar ve meta */}
      <div className="text-gray-600 text-base mb-4 flex flex-wrap gap-2 items-center">
        <span>
          {res.author?.firstName} {res.author?.lastName}
        </span>
        <span>•</span>
        <span>{formatDate(res.publishedAt)}</span>
        <span>•</span>
        <span className="text-xs px-2 py-0.5 border border-blue-300 rounded bg-blue-50 text-blue-700 font-semibold">
          {res.accessTier === "FREE" ? "Ücretsiz" : res.accessTier}
        </span>
      </div>
      {/* Açıklama */}
      {res.excerpt && (
        <p className="mb-6 text-gray-800 text-lg leading-relaxed">
          {res.excerpt}
        </p>
      )}
      {/* Link */}
      {res.link && (
        <Link
          href={res.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-6 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-medium"
        >
          İçeriği Aç
        </Link>
      )}
      <p>{res.link}</p>
    </main>
  );
}
