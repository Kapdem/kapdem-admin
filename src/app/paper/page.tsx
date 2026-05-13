export const dynamic = "force-dynamic";
import React, { Suspense } from "react";
import { getAllPosts } from "@/lib/posts/data";
import PaperGrid from "@/components/Paper/PaperGrid";
import SimpleGrid from "@/components/Paper/SimpleGrid";
import PaperSearch from "@/components/Paper/PaperSearch";
import Link from "next/link";

type Props = {
  searchParams?: {
    search?: string;
    tier?: string;
    view?: string;
    page?: string;
  };
};

export default async function page({ searchParams }: Props) {
  try {
    const sp = await (searchParams as any);
    const currentPage = Math.max(1, Number(sp?.page || 1));
    const postsResponse = await getAllPosts({ page: currentPage, limit: 50 });

    let posts: any[] = [];
    let total = 0;
    let limit = 50;

    if (
      postsResponse &&
      (postsResponse as any).data &&
      Array.isArray((postsResponse as any).data)
    ) {
      posts = (postsResponse as any).data;
      total = Number((postsResponse as any).total || 0);
      limit = Number((postsResponse as any).limit || 50);
    } else if (Array.isArray(postsResponse)) {
      posts = postsResponse as any;
      total = posts.length;
    } else if (postsResponse && typeof postsResponse === "object") {
      for (const key in postsResponse) {
        if (Array.isArray((postsResponse as any)[key])) {
          posts = (postsResponse as any)[key];
          break;
        }
      }
      total = posts.length;
    }

    const searchTerm = sp?.search ? String(sp.search).toLowerCase() : undefined;
    const accessTier = sp?.tier || undefined;
    const viewType = sp?.view || "table";
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const createPageQuery = (nextPage: number) =>
      new URLSearchParams({
        ...(sp?.search ? { search: sp.search } : {}),
        ...(sp?.tier ? { tier: sp.tier } : {}),
        ...(sp?.view ? { view: sp.view } : {}),
        page: String(nextPage),
      }).toString();

    let filteredPosts = Array.isArray(posts) ? posts : [];

    if (searchTerm && filteredPosts.length > 0) {
      filteredPosts = filteredPosts.filter((post: any) => {
        // Çoklu dil desteği: önce translations.tr.title, sonra eski title
        const title = post.translations?.tr?.title || post.title || "";
        const authorName = (
          (post.author?.firstName || "") +
          " " +
          (post.author?.lastName || "")
        ).trim();
        return (
          title.toLowerCase().includes(searchTerm) ||
          authorName.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (accessTier && filteredPosts.length > 0) {
      filteredPosts = filteredPosts.filter(
        (post: any) => post.accessTier === accessTier,
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yayınlar</h1>
          <Link
            href="/paper/add"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Yeni Yayın Ekle
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3">
            <Suspense fallback={<div />}>
              <PaperSearch />
            </Suspense>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <div className="bg-gray-100 p-1 rounded-md flex">
            <Link
              href={`/paper?${new URLSearchParams({
                ...(sp?.search ? { search: sp.search } : {}),
                ...(sp?.tier ? { tier: sp.tier } : {}),
                view: "table",
                ...(sp?.page ? { page: sp.page } : {}),
              }).toString()}`}
              className={`px-3 py-1.5 rounded text-sm flex items-center ${
                viewType === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Tablo Görünümü
            </Link>
            <Link
              href={`/paper?${new URLSearchParams({
                ...(sp?.search ? { search: sp.search } : {}),
                ...(sp?.tier ? { tier: sp.tier } : {}),
                view: "cards",
                ...(sp?.page ? { page: sp.page } : {}),
              }).toString()}`}
              className={`px-3 py-1.5 rounded text-sm flex items-center ${
                viewType === "cards"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Kart Görünümü
            </Link>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-xl font-medium">
              Herhangi bir yayın bulunamadı
            </p>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              Arama kriterlerinize uygun yayın bulunamadı. Lütfen filtrelerinizi
              değiştirip tekrar deneyin.
            </p>
          </div>
        ) : (
          <>
            {viewType === "table" ? (
              <PaperGrid posts={filteredPosts} />
            ) : (
              <SimpleGrid posts={filteredPosts} />
            )}

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Toplam <span className="font-semibold">{total}</span> yazı •
                Sayfa <span className="font-semibold">{safeCurrentPage}</span> /{" "}
                {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {safeCurrentPage > 1 ? (
                  <Link
                    href={`/paper?${createPageQuery(safeCurrentPage - 1)}`}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Önceki
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                    Önceki
                  </span>
                )}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={`/paper?${createPageQuery(pageNumber)}`}
                    className={`px-3 py-1.5 rounded-md border text-sm ${
                      pageNumber === safeCurrentPage
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                {safeCurrentPage < totalPages ? (
                  <Link
                    href={`/paper?${createPageQuery(safeCurrentPage + 1)}`}
                    className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sonraki
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                    Sonraki
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading posts:", error);
    return (
      <div className="p-6">
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-red-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 text-xl font-medium">
            Veriler yüklenirken bir hata oluştu
          </p>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            Lütfen daha sonra tekrar deneyin veya sistem yöneticisiyle iletişime
            geçin.
          </p>
        </div>
      </div>
    );
  }
}
