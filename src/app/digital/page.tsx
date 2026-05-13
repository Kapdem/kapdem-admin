"use client";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { useEffect, useState, useMemo } from "react";
import { getPostByCategory } from "@/lib/posts/data";
import { upgradeTier, downgradeTier, deletePost } from "@/lib/admin/action";
import { Edit, Eye, Trash } from "lucide-react";
import Swal from "sweetalert2";
import {
  AllCommunityModule,
  ModuleRegistry,
  ValueGetterParams,
  ValueFormatterParams,
  ICellRendererParams,
} from "ag-grid-community";

interface Author {
  firstName: string;
  lastName: string;
}

interface DigitalPost {
  _id?: string;
  id?: string;
  title: string;
  author?: Author;
  publishedAt?: string;
  accessTier: string;
}

interface TierInfo {
  [key: string]: unknown;
}

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DigitalPage() {
  const [rowData, setRowData] = useState<DigitalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "podcastler" | "videolar"
  >("podcastler");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPostByCategory(selectedCategory);
      setRowData(res.posts || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Başlık",
        field: "title" as keyof DigitalPost,
        flex: 3,
        minWidth: 250,
        wrapText: true,
        autoHeight: true,
      },
      {
        headerName: "Yazar",
        field: "author" as keyof DigitalPost,
        valueGetter: (params: ValueGetterParams<DigitalPost, any>) =>
          params.data && params.data.author
            ? `${params.data.author.firstName} ${params.data.author.lastName}`
            : "Bilinmiyor",
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Tarih",
        field: "publishedAt" as keyof DigitalPost,
        valueFormatter: (params: ValueFormatterParams<DigitalPost, any>) =>
          params.value
            ? new Date(params.value as string).toLocaleDateString("tr-TR")
            : "Tarih yok",
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "İçerik Tier",
        field: "accessTier" as keyof DigitalPost,
        flex: 2,
        minWidth: 180,
        cellRenderer: (params: ICellRendererParams<DigitalPost, any>) => {
          const tier = params.value as string;
          const id = params.data?._id || params.data?.id;
          const tierOrder = [
            "FREE",
            "PAID",
            "PREMIUM",
            "ADMIN",
            "EDITOR",
            "SUPER_ADMIN",
          ];
          const currentIndex = tierOrder.indexOf(tier);

          const handleUpgrade = async () => {
            await upgradeTier(id);
            fetchData();
          };
          const handleDowngrade = async () => {
            await downgradeTier(id);
            fetchData();
          };

          const getTierColor = (tier: string) => {
            switch (tier) {
              case "FREE":
                return "bg-gray-100 text-gray-700 border-gray-200";
              case "PAID":
                return "bg-blue-100 text-blue-700 border-blue-200";
              case "PREMIUM":
                return "bg-purple-100 text-purple-700 border-purple-200";
              case "ADMIN":
                return "bg-orange-100 text-orange-700 border-orange-200";
              case "EDITOR":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
              case "SUPER_ADMIN":
                return "bg-red-100 text-red-700 border-red-200";
              default:
                return "bg-gray-100 text-gray-700 border-gray-200";
            }
          };

          return (
            <div className="flex items-center gap-2 py-1">
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getTierColor(
                  tier
                )}`}
              >
                {tier}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleUpgrade}
                  disabled={currentIndex === tierOrder.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Tier Yükselt"
                >
                  ↑
                </button>
                <button
                  onClick={handleDowngrade}
                  disabled={currentIndex === 0}
                  className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Tier Düşür"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        },
      },
      {
        field: "_id" as keyof DigitalPost,
        headerName: "İşlemler",
        flex: 2,
        minWidth: 220,
        maxWidth: 250,
        sortable: false,
        filter: false,
        cellClass: "action-cell",
        headerClass: "action-header",
        cellRenderer: (params: ICellRendererParams<DigitalPost, any>) => {
          const id = params.value;

          const handleDelete = async () => {
            // SweetAlert ile modern onay dialog'u
            const result = await Swal.fire({
              title: "⚠️ DİKKAT!",
              html: `
                <div style="text-align: left; margin: 20px 0;">
                  <p style="margin-bottom: 15px; font-weight: bold;">Bu dijital içeriği silmek istediğinizden emin misiniz?</p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 8px;">• Bu işlem <strong>GERİ ALINAMAZ</strong></li>
                    <li style="margin-bottom: 8px;">• İçerik kalıcı olarak silinecektir</li>
                    <li style="margin-bottom: 8px;">• Tüm veriler kaybolacaktır</li>
                  </ul>
                </div>
              `,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#dc2626",
              cancelButtonColor: "#6b7280",
              confirmButtonText: "🗑️ Evet, Sil!",
              cancelButtonText: "❌ İptal",
              reverseButtons: true,
              focusCancel: true,
              customClass: {
                popup: "swal-wide",
              },
            });

            if (!result.isConfirmed) {
              return;
            }

            try {
              const response = await deletePost(id);

              if (response && !response.statusCode) {
                // Başarılı silme
                await Swal.fire({
                  title: "✅ Başarılı!",
                  text: "Dijital içerik başarıyla silindi. Liste yenilenecek...",
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                  timerProgressBar: true,
                });
                fetchData();
              } else {
                throw new Error(response?.message || "Silme işlemi başarısız");
              }
            } catch (error: any) {
              console.error("Post silme hatası:", error);

              let title = "❌ Hata Oluştu";
              let text = "İçerik silinirken bir hata oluştu.";
              let icon: "error" | "warning" = "error";

              if (error.message) {
                if (
                  error.message.includes("403") ||
                  error.message.includes("Forbidden")
                ) {
                  title = "🔒 Yetki Hatası";
                  text =
                    "Bu işlem için SÜPER ADMİN yetkisi gereklidir. Lütfen yöneticinizle iletişime geçin.";
                  icon = "warning";
                } else if (
                  error.message.includes("404") ||
                  error.message.includes("bulunamadı")
                ) {
                  title = "📄 İçerik Bulunamadı";
                  text =
                    "Bu içerik zaten silinmiş olabilir veya mevcut değil. Liste yenilenecek.";
                  icon = "warning";
                  fetchData();
                } else if (
                  error.message.includes("401") ||
                  error.message.includes("Unauthorized")
                ) {
                  title = "🔐 Oturum Hatası";
                  text = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
                  icon = "warning";
                } else {
                  text = `Beklenmeyen bir hata oluştu: ${error.message}`;
                }
              }

              await Swal.fire({
                title,
                text,
                icon,
                confirmButtonText: "Tamam",
                confirmButtonColor: "#3b82f6",
                footer:
                  "<small>💡 Sorun devam ederse sistem yöneticisiyle iletişime geçin.</small>",
              });
            }
          };

          return (
            <div className="flex space-x-2">
              <a
                href={`/digital/${id}`}
                className="px-2 py-1 text-xs flex items-center gap-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="İçeriği görüntüle"
              >
                <Eye className="w-4 h-4" /> Görüntüle
              </a>
              <a
                href={`/digital/${id}/edit`}
                className="px-2 py-1 text-xs flex items-center gap-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                title="İçeriği düzenle"
              >
                <Edit className="w-4 h-4" /> Düzenle
              </a>
              <button
                onClick={handleDelete}
                className="px-2 py-1 flex items-center gap-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 shadow-sm"
                title="İçeriği sil (Geri alınamaz)"
              >
                <Trash className="w-4 h-4" /> Sil
              </button>
            </div>
          );
        },
      },
    ],
    [selectedCategory]
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-2">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Kapdem Dijital</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <label className="font-medium text-gray-700">
          İçerik Türü:
          <select
            className="ml-2 px-3 py-2 border rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as "podcastler" | "videolar")
            }
          >
            <option value="podcastler">Podcastler</option>
            <option value="videolar">Videolar</option>
          </select>
        </label>
      </div>

      <div className="ag-theme-material w-full" style={{ height: 600 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          suppressCellFocus={true}
          overlayLoadingTemplate={
            loading ? "<span>Yükleniyor...</span>" : undefined
          }
          getRowHeight={() => 80}
        />
      </div>
    </div>
  );
}
