import { getSpecialFileById } from "@/lib/special-files/data";
import Image from "next/image";
import { Calendar, User, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SpecialFileDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;
  const specialFile = await getSpecialFileById(awaitedParams.id);

  if (!specialFile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">
            Dosya Bulunamadı
          </h1>
          <p className="text-gray-500 mb-6">
            Aradığınız özel dosya mevcut değil.
          </p>
          <Link
            href="/special-files"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = specialFile.publishedAt
    ? new Date(specialFile.publishedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tarih belirtilmemiş";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/special-files"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Özel Dosyalara Dön
        </Link>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header with Cover Image */}
          {specialFile.coverImage && (
            <div className="relative w-full h-64 md:h-96 overflow-hidden bg-gray-200">
              <Image
                src={specialFile.coverImage}
                alt={specialFile.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {specialFile.title}
                </h1>
              </div>
            </div>
          )}

          {/* Title without cover */}
          {!specialFile.coverImage && (
            <div className="p-8 border-b">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase bg-blue-100 text-blue-700 rounded">
                {specialFile.accessTier}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {specialFile.title}
              </h1>
            </div>
          )}

          {/* Meta Information */}
          <div className="px-8 py-4 bg-gray-50 border-b">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              {specialFile.author && (
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium">
                    {specialFile.author.firstName} {specialFile.author.lastName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          {specialFile.excerpt && (
            <div className="px-8 py-6 bg-blue-50 border-l-4 border-blue-600">
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {specialFile.excerpt}
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="p-8">
            {specialFile.content?.html && (
              <div
                className="prose prose-lg max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: specialFile.content.html }}
              />
            )}

            {/* Gallery */}
            {specialFile.galleryImages &&
              specialFile.galleryImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  {specialFile.galleryImages.map((img: any, idx: any) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Author Card */}
          {specialFile.author && (
            <div className="px-8 py-6 bg-gray-50 border-t">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Image
                    src={`${
                      specialFile.author.profilePicture ||
                      "/images/onlylogo.png"
                    }`}
                    width={1000}
                    height={1000}
                    className="w-full h-full rounded-2xl object-cover"
                    alt={`${specialFile.author.firstName} ${specialFile.author.lastName}`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {specialFile.author.firstName} {specialFile.author.lastName}
                  </h4>
                  {specialFile.author.email && (
                    <p className="text-sm text-gray-600 mb-2">
                      {specialFile.author.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    KAPDEM Araştırma Merkezi
                  </p>
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
