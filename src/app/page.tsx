import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminData,
  getCategoriesList,
  getProfileData,
} from "@/lib/admin/data";
import {
  BarChart3,
  Users,
  FileText,
  Clock,
  Calendar,
  ArrowUpRight,
  PenSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import EditorPage from "@/components/Dashboard/EditorPage";
import CategoryGrid from "@/components/Dashboard/CategoryGrid";

// Define Activity interface
interface Activity {
  action: string;
  editorName: string;
  postTitle: string;
  timestamp: string;
}

// Define AdminData interface
interface AdminData {
  totalPosts: number;
  totalEditors: number;
  recentActivity: Activity[];
}

// Activity icon component based on action type
const ActivityIcon = ({ action }: { action: string }) => {
  switch (action) {
    case "create":
      return <Plus className="h-4 w-4 text-green-500" />;
    case "update":
      return <PenSquare className="h-4 w-4 text-blue-500" />;
    case "delete":
      return <RefreshCw className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default async function DashboardPage() {
  const res = await getProfileData();
  // Beklenen profil yapısı yoksa (ör: auth yok) erken dönüş yap
  if (!res || typeof res !== "object" || !res.user) {
    redirect("/login");
  }
  const categoryList = await getCategoriesList();

  const adminData = (await getAdminData()) as AdminData;
  const { totalPosts, totalEditors, recentActivity } = adminData;

  if (res?.user?.role !== "SUPER_ADMIN")
    return (
      <div className="max-w-7xl w-full mx-auto">
        <EditorPage />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        {/* İçerik İstatistikleri kutusu burada */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              KAPDEM Admin Paneli
            </h1>
            <p className="text-gray-500 mt-1">
              Yönetim istatistikleri ve son aktiviteler
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/paper/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Yeni Yazı Ekle
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Posts Card */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Yazı</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalPosts}</h3>
            </div>
            <div className="ml-auto">
              <Link href="/paper" className="text-blue-600 hover:text-blue-800">
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Total Editors Card */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Editör</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalEditors}
              </h3>
            </div>
          </div>

          {/* Today's Activity Card */}
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Bugünkü Aktivite
              </p>
              <h3 className="text-2xl font-bold text-gray-800">
                {
                  recentActivity?.filter((activity: Activity) => {
                    const today = new Date().toISOString().split("T")[0];
                    const activityDate = new Date(activity.timestamp)
                      .toISOString()
                      .split("T")[0];
                    return today === activityDate;
                  }).length
                }
              </h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Son Aktiviteler
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {recentActivity?.length === 0 ? (
                  <p className="text-gray-500">Henüz aktivite bulunmuyor.</p>
                ) : (
                  recentActivity?.map((activity: Activity, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="rounded-full bg-gray-100 p-2 mt-1">
                        <ActivityIcon action={activity.action} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <p className="font-medium text-gray-800">
                            {activity.editorName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          <span className="capitalize">
                            {activity.action === "create"
                              ? "oluşturdu"
                              : activity.action === "update"
                              ? "güncelledi"
                              : activity.action}
                          </span>
                          <span className="text-gray-600">
                            : {activity.postTitle}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                İçerik İstatistikleri
              </h2>
            </div>
            <div className="p-6">
              {/* Activity Distribution */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  Aktivite Dağılımı
                </h3>
                <div className="space-y-3">
                  {/* Create Actions */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Oluşturma
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {
                          recentActivity?.filter(
                            (a: Activity) => a.action === "create"
                          ).length
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${
                            (recentActivity?.filter(
                              (a: Activity) => a.action === "create"
                            ).length /
                              recentActivity?.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Update Actions */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Güncelleme
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {
                          recentActivity?.filter(
                            (a: Activity) => a.action === "update"
                          ).length
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${
                            (recentActivity?.filter(
                              (a: Activity) => a.action === "update"
                            ).length /
                              recentActivity?.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  Hızlı Erişim
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/paper/add"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <FileText className="h-5 w-5 text-blue-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Yazı Ekle
                    </span>
                  </Link>
                  <Link
                    href="/events/add"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <Calendar className="h-5 w-5 text-purple-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Etkinlik Ekle
                    </span>
                  </Link>
                  <Link
                    href="/digital/add"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <BarChart3 className="h-5 w-5 text-amber-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Digital İçerik
                    </span>
                  </Link>
                  <Link
                    href="/paper"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <FileText className="h-5 w-5 text-green-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Tüm Yazılar
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <CategoryGrid categories={categoryList} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
