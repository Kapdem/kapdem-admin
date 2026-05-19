import { getViewStats, getCategoriesList } from "@/lib/admin/data";
import { Eye, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import PostViewsSection from "./PostViewsSection";

type Props = {};

export default async function page({}: Props) {
  // Paralel olarak tüm istatistikleri ve kategori listesini çek
  const [allTimeStats, monthStats, weekStats, categoriesList] =
    await Promise.all([
      getViewStats("all"),
      getViewStats("month"),
      getViewStats("week"),
      getCategoriesList(),
    ]);

  // fetchInstance zaten data'yı extract ediyor, direkt erişebiliriz
  const allTimeViews = allTimeStats?.totalViews || 0;
  const monthViews = monthStats?.totalViews || 0;
  const weekViews = weekStats?.totalViews || 0;

  const topPosts = allTimeStats?.topPosts || [];
  const viewsByCategory = allTimeStats?.viewsByCategory || [];

  // Kategori slug -> okunabilir isim eşlemesi
  // (örn. "kamu-politikalari" -> "Kamu Politikaları")
  const categoryNameMap: Record<string, string> = Array.isArray(categoriesList)
    ? categoriesList.reduce((acc: Record<string, string>, c: any) => {
        if (c?.category) acc[c.category] = c.name || c.category;
        return acc;
      }, {})
    : {};

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
              <span className="font-semibold">Not:</span> Haftalık ve aylık
              sayımlar, tarihli görüntülenme takibinin devreye girdiği andan
              itibaren biriken verilerden hesaplanır; bu nedenle ilk haftalarda
              düşük görünüp zamanla dolar. &quot;Toplam Görüntülenme&quot; tüm
              geçmişi kapsamaya devam eder.
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

        {/* Kategoriler + tüm yazıların görüntülenme tablosu */}
        <PostViewsSection
          topPosts={topPosts}
          viewsByCategory={viewsByCategory}
          categoryNameMap={categoryNameMap}
        />
      </div>
    </div>
  );
}
