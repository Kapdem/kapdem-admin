"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

type Post = {
  _id: string;
  title?: string;
  viewCount: number;
  publishedAt?: string;
  categories?: string[];
};

type Props = {
  posts: Post[];
  /** Seçili kategori slug'ı; verilirse tablo o kategoriye filtrelenir. */
  categoryFilter?: string | null;
  /** Kategori slug -> okunabilir isim eşlemesi. */
  categoryNameMap?: Record<string, string>;
};

const PAGE_SIZE = 50;

export default function PostViewsTable({
  posts,
  categoryFilter = null,
  categoryNameMap = {},
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Kategori filtresi değişince ilk sayfaya dön.
  useEffect(() => {
    setPage(1);
  }, [categoryFilter]);

  // Önce kategori filtresi uygulanır.
  const categoryFilteredPosts = useMemo(() => {
    if (!categoryFilter) return posts;
    return posts.filter(
      (p) =>
        Array.isArray(p.categories) && p.categories.includes(categoryFilter),
    );
  }, [posts, categoryFilter]);

  // Sıra numarası, mevcut görünümdeki (kategori içi) gerçek sırayı yansıtır.
  // Backend yazıları görüntülenmeye göre azalan sıralı gönderir.
  const rankedPosts = useMemo(
    () =>
      categoryFilteredPosts.map((post, index) => ({
        ...post,
        rank: index + 1,
      })),
    [categoryFilteredPosts],
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rankedPosts;
    return rankedPosts.filter((post) =>
      (post.title || "").toLowerCase().includes(q),
    );
  }, [rankedPosts, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  // Filtre sonrası mevcut sayfa aralık dışına düşerse son sayfaya sabitle.
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1); // arama değişince ilk sayfaya dön
  };

  const categoryLabel = (slug: string) => categoryNameMap[slug] || slug;

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Henüz görüntülenme verisi bulunmuyor</p>
      </div>
    );
  }

  return (
    <div>
      {/* Arama + sayaç */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Yazı başlığında ara..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <span className="text-sm text-gray-500">
          {query
            ? `${filteredPosts.length} / ${categoryFilteredPosts.length} yazı`
            : `Toplam ${categoryFilteredPosts.length} yazı`}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Yazı Başlığı
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Görüntülenme
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Yayın Tarihi
              </th>
            </tr>
          </thead>
          <tbody>
            {pagePosts.map((post) => (
              <tr
                key={post._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      post.rank === 1
                        ? "bg-yellow-100 text-yellow-700"
                        : post.rank === 2
                          ? "bg-gray-100 text-gray-700"
                          : post.rank === 3
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {post.rank}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/paper/${post._id}`}
                    className="text-gray-900 hover:text-blue-600 font-medium line-clamp-2"
                  >
                    {post.title || "Başlıksız"}
                  </Link>
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {post.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {categoryLabel(cat)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">
                      {(post.viewCount || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </td>
              </tr>
            ))}
            {filteredPosts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-gray-500 text-sm"
                >
                  {query
                    ? "Aramanıza uygun yazı bulunamadı."
                    : "Bu kategoride yazı bulunamadı."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-gray-500">
            Sayfa <span className="font-semibold">{currentPage}</span> /{" "}
            {totalPages}
            <span className="text-gray-400">
              {"  "}({(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredPosts.length)} arası)
            </span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki
            </button>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sonraki
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
