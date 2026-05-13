import { getViewStats } from "@/lib/admin/data";
import React from "react";
import {
  Eye,
  TrendingUp,
  Calendar,
  BarChart3,
  Award,
  BookOpen,
  Tag,
} from "lucide-react";
import Link from "next/link";

type Props = {};

export default async function page({}: Props) {
  // Paralel olarak tüm istatistikleri çek
  const [allTimeStats, monthStats, weekStats] = await Promise.all([
    getViewStats("all"),
    getViewStats("month"),
    getViewStats("week"),
  ]);

  // fetchInstance zaten data'yı extract ediyor, direkt erişebiliriz
  const allTimeViews = allTimeStats?.totalViews || 0;
  const monthViews = monthStats?.totalViews || 0;
  const weekViews = weekStats?.totalViews || 0;

  const topPosts = allTimeStats?.topPosts || [];
  const viewsByCategory = allTimeStats?.viewsByCategory || [];
  const weekTopPosts = weekStats?.topPosts || [];
  const monthTopPosts = monthStats?.topPosts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Yazı Görüntülenme İstatistikleri
          </h1>
          <p className="text-gray-600">
            Yazılarınızın okunma sayılarını takip edin
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Not:</span> Şu anda tüm dönemler
              için toplam görüntülenme sayısı gösterilmektedir. Tarihsel analiz
              için view tracking sistemine tarih desteği eklenmelidir.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tüm Zamanlar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Tüm Zamanlar
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-gray-900">
                {allTimeViews.toLocaleString("tr-TR")}
              </p>
              <p className="text-sm text-gray-500">Toplam Görüntülenme</p>
            </div>
          </div>

          {/* Aylık */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Son 30 Gün
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-gray-900">
                {monthViews.toLocaleString("tr-TR")}
              </p>
              <p className="text-sm text-gray-500">Aylık Görüntülenme</p>
            </div>
            {allTimeViews > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Toplam görüntülenmenin</span>
                  <span className="font-semibold text-blue-600">
                    %{Math.round((monthViews / allTimeViews) * 100)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Haftalık */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Son 7 Gün
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-gray-900">
                {weekViews.toLocaleString("tr-TR")}
              </p>
              <p className="text-sm text-gray-500">Haftalık Görüntülenme</p>
            </div>
            {allTimeViews > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Toplam görüntülenmenin</span>
                  <span className="font-semibold text-green-600">
                    %{Math.round((weekViews / allTimeViews) * 100)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* En Çok Okunan Yazılar */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">
              En Çok Okunan Yazılar (Tüm Zamanlar)
            </h2>
          </div>

          {topPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Henüz görüntülenme verisi bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
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
                  {topPosts.slice(0, 10).map((post: any, index: number) => (
                    <tr
                      key={post._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {index + 1}
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
                          <div className="flex gap-1 mt-1">
                            {post.categories.slice(0, 2).map((cat: string) => (
                              <span
                                key={cat}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-lg font-bold text-gray-900">
                            {post.viewCount.toLocaleString("tr-TR")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "tr-TR",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Kategorilere Göre Görüntülenmeler */}
        {viewsByCategory.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Kategorilere Göre Görüntülenmeler
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {viewsByCategory.slice(0, 9).map((category: any) => (
                <div
                  key={category.category}
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {category.category}
                    </h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
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
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (category.totalViews / allTimeViews) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
