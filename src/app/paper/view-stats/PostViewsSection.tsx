"use client";

import { useMemo, useState } from "react";
import { Award, Tag, X } from "lucide-react";
import PostViewsTable from "./PostViewsTable";

type Post = {
  _id: string;
  title?: string;
  viewCount: number;
  publishedAt?: string;
  categories?: string[];
};

type CategoryStat = {
  category: string;
  totalViews: number;
  postCount: number;
  averageViews: number;
};

type Props = {
  topPosts: Post[];
  viewsByCategory: CategoryStat[];
  categoryNameMap: Record<string, string>;
};

export default function PostViewsSection({
  topPosts,
  viewsByCategory,
  categoryNameMap,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryName = (slug: string) => categoryNameMap[slug] || slug;

  // İlerleme çubuğu, en çok görüntülenen kategoriye göre orantılanır.
  const maxCatViews = useMemo(
    () => Math.max(1, ...viewsByCategory.map((c) => c.totalViews || 0)),
    [viewsByCategory],
  );

  const selectedName = selectedCategory ? categoryName(selectedCategory) : null;

  return (
    <>
      {/* Kategorilere Göre Görüntülenmeler */}
      {viewsByCategory.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <div className="flex items-center gap-3">
              <Tag className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Kategorilere Göre Görüntülenmeler
              </h2>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                <X className="w-4 h-4" />
                Filtreyi temizle
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Bir kategoriye tıklayarak o kategorideki yazıları aşağıdaki tabloda
            görebilirsiniz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viewsByCategory.map((category) => {
              const isActive = selectedCategory === category.category;
              return (
                <button
                  type="button"
                  key={category.category}
                  onClick={() =>
                    setSelectedCategory(isActive ? null : category.category)
                  }
                  className={`text-left p-4 border rounded-xl transition-all ${
                    isActive
                      ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {categoryName(category.category)}
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {category.postCount} yazı
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Toplam:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {category.totalViews.toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ortalama:</span>
                      <span className="text-sm font-semibold text-indigo-600">
                        {category.averageViews.toLocaleString("tr-TR")} / yazı
                      </span>
                    </div>
                  </div>
                  {/* İlerleme çubuğu */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (category.totalViews / maxCatViews) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Yazı listesi */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {selectedName
              ? `"${selectedName}" Kategorisindeki Yazılar`
              : "Tüm Yazıların Görüntülenme Sayıları (Çoktan Aza)"}
          </h2>
        </div>

        {selectedCategory && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm">
              Kategori filtresi: <strong>{selectedName}</strong>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="hover:text-indigo-900"
                aria-label="Filtreyi temizle"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          </div>
        )}

        <PostViewsTable
          posts={topPosts}
          categoryFilter={selectedCategory}
          categoryNameMap={categoryNameMap}
        />
      </div>
    </>
  );
}
