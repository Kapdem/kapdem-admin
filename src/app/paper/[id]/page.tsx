import { getPostById } from "@/lib/posts/data";
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  params: {
    id: string;
  };
};

export default async function PaperDetailPage({ params }: Props) {
  const p = await (params as any);
  const paper = await getPostById(p.id);

  const publishDate = paper.publishedAt ? new Date(paper.publishedAt) : null;
  const formattedDate =
    publishDate && !isNaN(publishDate.getTime())
      ? format(publishDate, "dd MMMM yyyy", { locale: tr })
      : "Geçersiz tarih";

  // Çoklu dil desteği: önce translations.tr.title, sonra eski title
  const title = paper.translations?.tr?.title || paper.title || "";
  const excerpt = paper.translations?.tr?.excerpt || paper.excerpt || "";
  const contentHtml =
    paper.translations?.tr?.content?.html || paper?.content?.html || "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-full">
      <div className="mb-8">
        <Image
          src={paper.coverImage || "/placeholder-image.png"}
          alt={title}
          className="w-full h-[500px] aspect-video object-cover mb-4"
          width={1920}
          height={1080}
        />
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
          <div>
            <span className="font-semibold">Yazar: </span>
            {paper.author?.firstName} {paper.author?.lastName}
          </div>
          <div>
            <span className="font-semibold">Yayın Tarihi: </span>
            {formattedDate}
          </div>

          {paper.accessTier && (
            <div>
              <span className="font-semibold">Erişim: </span>
              <span
                className={
                  paper.accessTier === "FREE"
                    ? "text-green-600"
                    : "text-blue-600"
                }
              >
                {paper.accessTier === "FREE" ? "Ücretsiz" : "Premium"}
              </span>
            </div>
          )}
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4">
              <Link
                href={`/paper/${paper._id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit size={16} />
                Düzenle
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none paper-content">
        <div
          dangerouslySetInnerHTML={{
            __html: contentHtml || excerpt || "",
          }}
        />
      </div>
    </div>
  );
}
