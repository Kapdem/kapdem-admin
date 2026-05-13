"use client";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  GridApi,
  GridReadyEvent,
  FilterChangedEvent,
} from "ag-grid-community";
import { File, Edit, Eye, Trash } from "lucide-react";
import { sort } from "fast-sort";
import { deleteEvent } from "@/lib/admin/action";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

interface EventTranslation {
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
}

interface Event {
  _id: string;
  translations: {
    tr?: EventTranslation;
    en?: EventTranslation;
  };
  coverImage?: string;
  galleryImages?: string[];
  location?: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "publish" | "private" | "trash";
  createdBy?: User;
  lastEditedBy?: User;
  createdAt: string;
  updatedAt: string;
}

interface AgGridEventsProps {
  posts: Event[];
  upcomingEvents?: any;
  onRefresh?: () => void;
}

export default function AgGridEvents({
  posts,
  upcomingEvents,
  onRefresh,
}: AgGridEventsProps) {
  const safePostsData = Array.isArray(posts) ? posts : [];
  const [rowData, setRowData] = useState<Event[]>(safePostsData);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);

  useEffect(() => {
    if (posts && Array.isArray(posts) && posts.length > 0) {
      // Sadece posts'u kullan, upcomingEvents varsa onu da ekle
      const allPosts =
        upcomingEvents?.posts && Array.isArray(upcomingEvents.posts)
          ? [...safePostsData, ...upcomingEvents.posts]
          : safePostsData;

      setRowData(sort(allPosts).desc((p) => p.startDate || p.createdAt));
    } else if (posts) {
      setRowData(safePostsData);
    }
  }, [posts, upcomingEvents, safePostsData]);

  const columnDefs = useMemo<ColDef<Event>[]>(
    () => [
      {
        headerName: "Başlık",
        flex: 2,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 200,
        wrapText: true,
        autoHeight: true,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueGetter: (params: any) => {
          return params.data.translations?.tr?.title || "";
        },
        cellRenderer: (params: any) => {
          const title = params.data.translations?.tr?.title || "";
          return (
            <div
              className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
              title={title}
            >
              {title}
            </div>
          );
        },
        cellStyle: {
          display: "flex",
          alignItems: "center",
          padding: "12px 8px",
          whiteSpace: "normal",
          lineHeight: "1.4",
        },
      },
      {
        field: "location",
        headerName: "Konum",
        flex: 1,
        minWidth: 150,
        valueGetter: (params: any) => {
          return params.data.location || "-";
        },
        filter: "agTextColumnFilter",
        sortable: true,
        wrapText: false,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => {
          const location = params.data.location || "-";
          return (
            <div className="flex items-center">
              <span className="text-gray-700 truncate">{location}</span>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "Durum",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const status = params.value || "draft";
          const statusMap: Record<
            string,
            { color: string; bgColor: string; label: string }
          > = {
            publish: {
              color: "text-green-800",
              bgColor: "bg-green-100",
              label: "Yayında",
            },
            draft: {
              color: "text-yellow-800",
              bgColor: "bg-yellow-100",
              label: "Taslak",
            },
            private: {
              color: "text-gray-800",
              bgColor: "bg-gray-100",
              label: "Özel",
            },
            trash: {
              color: "text-red-800",
              bgColor: "bg-red-100",
              label: "Çöp",
            },
          };
          const { color, bgColor, label } = statusMap[status] || {
            color: "text-gray-800",
            bgColor: "bg-gray-100",
            label: status,
          };
          return (
            <div
              className={`flex items-center ${bgColor} ${color} px-3 py-1 rounded-full`}
            >
              <span className="text-xs font-medium">{label}</span>
            </div>
          );
        },
      },
      {
        field: "startDate",
        headerName: "Başlangıç Tarihi",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params: any) => {
          return params.value
            ? new Date(params.value).toLocaleDateString("tr-TR")
            : "-";
        },
        filter: "agDateColumnFilter",
        sortable: true,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => {
          if (!params.value) return <span className="text-gray-500">-</span>;
          const date = new Date(params.value);
          const formattedDate = date.toLocaleDateString("tr-TR");
          const now = new Date();
          const daysDiff = Math.floor(
            (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          let dateLabel = "";
          if (daysDiff === 0) dateLabel = "Bugün";
          else if (daysDiff === -1) dateLabel = "Dün";
          else if (daysDiff < 0 && daysDiff > -7)
            dateLabel = `${Math.abs(daysDiff)} gün önce`;
          else if (daysDiff > 0 && daysDiff < 7)
            dateLabel = `${daysDiff} gün sonra`;
          return (
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="text-gray-700">{formattedDate}</div>
                {dateLabel && (
                  <div className="text-xs text-gray-500">{dateLabel}</div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        field: "_id",
        headerName: "İşlemler",
        flex: 1,
        minWidth: 200,
        sortable: false,
        filter: false,
        cellClass: "action-cell",
        headerClass: "action-header",
        cellRenderer: (params: any) => {
          const id = params.value;

          const handleDelete = async () => {
            // SweetAlert ile modern onay dialog'u
            const result = await Swal.fire({
              title: "⚠️ DİKKAT!",
              html: `
                <div style="text-align: left; margin: 20px 0;">
                  <p style="margin-bottom: 15px; font-weight: bold;">Bu etkinlik içeriğini silmek istediğinizden emin misiniz?</p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 8px;">• Bu işlem <strong>GERİ ALINAMAZ</strong></li>
                    <li style="margin-bottom: 8px;">• Etkinlik kalıcı olarak silinecektir</li>
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
              const response = await deleteEvent(id);

              if (response && !response.statusCode) {
                // Başarılı silme
                await Swal.fire({
                  title: "✅ Başarılı!",
                  text: "Etkinlik başarıyla silindi. Liste yenilenecek...",
                  icon: "success",
                  timer: 2000,
                  showConfirmButton: false,
                  timerProgressBar: true,
                });
                if (onRefresh) {
                  onRefresh();
                }
              } else {
                throw new Error(response?.message || "Silme işlemi başarısız");
              }
            } catch (error: any) {
              console.error("Post silme hatası:", error);

              let title = "❌ Hata Oluştu";
              let text = "Etkinlik silinirken bir hata oluştu.";
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
                  title = "📄 Etkinlik Bulunamadı";
                  text =
                    "Bu etkinlik zaten silinmiş olabilir veya mevcut değil. Liste yenilenecek.";
                  icon = "warning";
                  if (onRefresh) {
                    onRefresh();
                  }
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
                href={`/events/${id}`}
                className="px-2 py-1 text-xs flex items-center gap-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Etkinliği görüntüle"
              >
                <Eye className="w-3 h-3" /> Görüntüle
              </a>
              <a
                href={`/events/${id}/edit`}
                className="px-2 py-1 text-xs flex items-center gap-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                title="Etkinliği düzenle"
              >
                <Edit className="w-3 h-3" /> Düzenle
              </a>
              <button
                onClick={handleDelete}
                className="px-2 py-1 flex items-center gap-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 shadow-sm"
                title="Etkinliği sil (Geri alınamaz)"
              >
                <Trash className="w-3 h-3" /> Sil
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      suppressMovable: false,
      flex: 1,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        padding: "12px 8px",
        overflow: "hidden",
      },
      wrapText: false,
      autoHeight: false,
      headerClass: "ag-header-cell-custom",
    }),
    [],
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
      params.api.sizeColumnsToFit();
      setRowCount(params.api.getDisplayedRowCount());
    },
    [rowData],
  );

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      if (gridApi) {
        setRowCount(gridApi.getDisplayedRowCount());
      }
    },
    [gridApi],
  );

  useEffect(() => {
    const handleResize = () => {
      gridApi?.sizeColumnsToFit();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  const onExportCSV = useCallback(() => {
    gridApi?.exportDataAsCsv({
      fileName: `Etkinlikler_${new Date().toISOString().split("T")[0]}.csv`,
    });
  }, [gridApi]);

  return (
    <>
      <div className="max-w-7xl w-full mx-auto mb-4 my-12">
        <p className="text-2xl font-bold">Etkinlikler Listesi</p>
      </div>{" "}
      <div className="flex justify-between items-center mb-4 my-12 max-w-7xl w-full mx-auto">
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 flex items-center">
          <File className="mr-2" size={12} />
          <span>{rowCount} kayıt gösteriliyor</span>
        </div>
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all flex items-center text-sm shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          CSV Olarak İndir
        </button>
      </div>
      <div className=" max-w-7xl mx-auto w-full h-[500px] ag-theme-material rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={15}
          paginationPageSizeSelector={[15, 25, 50, 100]}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          animateRows={true}
          rowSelection="multiple"
          suppressCellFocus={true}
          enableCellTextSelection={true}
          overlayNoRowsTemplate="<div class='p-4 text-gray-500 flex flex-col items-center'><svg xmlns='http://www.w3.org/2000/svg' class='h-10 w-10 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg><span>Gösterilecek kayıt bulunamadı</span></div>"
          domLayout="normal"
          rowHeight={60}
          headerHeight={48}
          rowClass="hover:bg-blue-50"
          suppressRowVirtualisation={false}
          getRowHeight={(params) => {
            const title = params.data.title || "";
            if (title.length > 70) {
              return 80;
            }
            return 60;
          }}
        />
      </div>
    </>
  );
}
