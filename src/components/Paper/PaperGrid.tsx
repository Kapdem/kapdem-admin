"use client";

import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  FilterChangedEvent,
} from "ag-grid-community";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import PaperActions from "./PaperActions";
import { upgradeTier, downgradeTier } from "@/lib/admin/action";

ModuleRegistry.registerModules([AllCommunityModule]);

// Define the Post interface based on the sample data
interface Author {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Post {
  id: string;
  title?: string;
  translations?: {
    tr?: {
      title?: string;
      slug?: string;
    };
    en?: {
      title?: string;
      slug?: string;
    };
  };
  slug: string;
  accessTier: string;
  publishedAt: string;
  author: Author;
  lastEdited: string | null;
  isFeatured?: boolean;
  isEditorPick?: boolean;
}

interface PaperGridProps {
  posts: Post[];
}

// Erişim Düzeyi için renk kodları ve çeviriler
const accessTierMap: Record<
  string,
  { color: string; label: string; bgColor: string; icon: string }
> = {
  FREE: {
    color: "text-gray-800",
    bgColor: "bg-gray-100",
    label: "Ücretsiz İçerik",
    icon: "M12 2a10 10 0 100 20 10 10 0 000-20z", // örnek ikon
  },
  PAID: {
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    label: "Ücretli İçerik",
    icon: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z",
  },
  PREMIUM: {
    color: "text-purple-800",
    bgColor: "bg-purple-100",
    label: "Premium İçerik",
    icon: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  ADMIN: {
    color: "text-green-800",
    bgColor: "bg-green-100",
    label: "Admin Erişimi",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  EDITOR: {
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
    label: "Editör Erişimi",
    icon: "M12 4v16m8-8H4", // örnek ikon
  },
  SUPER_ADMIN: {
    color: "text-red-800",
    bgColor: "bg-red-100",
    label: "Süper Admin Erişimi",
    icon: "M12 2l9 21H3L12 2z", // örnek ikon
  },
};

export default function PaperGrid({ posts }: PaperGridProps) {
  // Veri kontrolü

  // Geçerli bir dizi değilse boş dizi kullan
  const safePostsData = Array.isArray(posts) ? posts : [];

  // Veriyi state'e atama
  const [rowData, setRowData] = useState<Post[]>(safePostsData);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);

  // Prop'lar değiştiğinde state'i güncelle
  useEffect(() => {
    setRowData(safePostsData);
  }, [posts]);

  // Define the columns configuration
  const columnDefs = useMemo<ColDef<Post>[]>(
    () => [
      {
        field: "title",
        headerName: "Başlık",
        flex: 2,
        minWidth: 160,
        wrapText: true,
        autoHeight: true,
        filter: "agTextColumnFilter",
        sortable: true,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        valueGetter: (params: any) => {
          // Çoklu dil desteği: önce translations.tr.title, sonra eski title
          if (!params || !params.data) return "";
          return params.data.translations?.tr?.title || params.data.title || "";
        },
        cellRenderer: (params: any) => {
          if (!params || !params.data) {
            return <div className="text-gray-400">Veri yok</div>;
          }
          // valueGetter'dan gelen değeri kullan
          const title =
            params.value ||
            params.data.translations?.tr?.title ||
            params.data.title ||
            "";
          return (
            <div className="flex items-center w-full">
              <div
                className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 w-full"
                title={title}
              >
                {title || "Başlık yok"}
              </div>
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
        field: "author" as keyof Post,
        headerName: "Yazar",
        flex: 1,
        minWidth: 150,
        valueGetter: (params: any) => {
          return params.data.author
            ? `${params.data.author.firstName} ${params.data.author.lastName}`
            : "";
        },
        filter: "agTextColumnFilter",
        sortable: true,
        wrapText: false,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => {
          const authorName = params.data.author
            ? `${params.data.author.firstName} ${params.data.author.lastName}`
            : "";
          return (
            <div className="flex items-center">
              <div className="min-w-[2rem] w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-2">
                {authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <span className="text-gray-700 truncate">{authorName}</span>
            </div>
          );
        },
      },

      {
        field: "accessTier" as keyof Post,
        headerName: "Erişim Düzeyi",
        flex: 1,
        minWidth: 180,
        cellRenderer: (params: any) => {
          const tier = params.value || "PAID";
          const { color, bgColor, label, icon } = accessTierMap[tier] || {
            color: "text-gray-800",
            bgColor: "bg-gray-100",
            label: params.value,
            icon: "",
          };

          // Tier sıralaması
          const tierOrder = [
            "FREE",
            "PAID",
            "PREMIUM",
            "ADMIN",
            "EDITOR",
            "SUPER_ADMIN",
          ];
          const currentIndex = tierOrder.indexOf(tier);

          // upgradeTier ve downgradeTier fonksiyonlarını doğrudan kullan
          const handleUpgrade = async () => {
            await upgradeTier(params.data.id);
            window.location.reload();
          };
          const handleDowngrade = async () => {
            await downgradeTier(params.data.id);
            window.location.reload();
          };

          return (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center ${bgColor} ${color} px-3 py-1 rounded-full`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d={icon} />
                </svg>
                <span className="text-xs font-medium">{label}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleUpgrade}
                  disabled={currentIndex === tierOrder.length - 1}
                  className={`px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-200 disabled:opacity-40`}
                  title="Tier Yükselt"
                >
                  ↑
                </button>
                <button
                  onClick={handleDowngrade}
                  disabled={currentIndex === 0}
                  className={`px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200 hover:bg-red-200 disabled:opacity-40`}
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
        field: "publishedAt" as keyof Post,
        headerName: "Yayın Tarihi",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params: any) => {
          return new Date(params.value).toLocaleDateString("tr-TR");
        },
        filter: "agDateColumnFilter",
        sortable: true,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => {
          const date = new Date(params.value);
          const formattedDate = date.toLocaleDateString("tr-TR");
          const now = new Date();
          const daysDiff = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
          );

          let dateLabel = "";
          if (daysDiff === 0) {
            dateLabel = "Bugün";
          } else if (daysDiff === 1) {
            dateLabel = "Dün";
          } else if (daysDiff < 7) {
            dateLabel = `${daysDiff} gün önce`;
          }

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
        field: "id" as keyof Post,
        headerName: "İşlemler",
        flex: 0,
        width: 170,
        minWidth: 170,
        sortable: false,
        filter: false,
        cellClass: "action-cell",
        headerClass: "action-header",
        cellRenderer: (params: any) => {
          return (
            <PaperActions
              id={params.data.id}
              isFeatured={params.data.isFeatured}
              isEditorPick={params.data.isEditorPick}
            />
          );
        },
      },
    ],
    [],
  );

  // Default column settings
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

  // Grid ready event handler
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
      params.api.sizeColumnsToFit();
      setRowCount(params.api.getDisplayedRowCount());

      // Grid hazır olduğunda veri kontrolü yap
    },
    [rowData],
  );

  // Filter changed event handler
  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      if (gridApi) {
        setRowCount(gridApi.getDisplayedRowCount());
      }
    },
    [gridApi],
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      gridApi?.sizeColumnsToFit();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  // Export to CSV functionality
  const onExportCSV = useCallback(() => {
    gridApi?.exportDataAsCsv({
      fileName: `Yayınlar_${new Date().toISOString().split("T")[0]}.csv`,
      processCellCallback: (params) => {
        if (params.column.getColId() === "accessTier" && params.value) {
          const tier = params.value;
          return accessTierMap[tier]?.label || params.value;
        }
        return params.value;
      },
    });
  }, [gridApi]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
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
      <div className="w-full h-[600px] ag-theme-material rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
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
          rowClassRules={{
            "bg-purple-50 hover:bg-purple-100": (params) =>
              !!params.data?.isEditorPick,
          }}
          suppressRowVirtualisation={false}
          getRowHeight={(params) => {
            // Başlık sütunu çok uzunsa satır yüksekliğini arttır
            // Veri normalize edildiği için direkt title field'ını kullan
            const title = params.data?.title || "";
            if (title.length > 70) {
              return 80; // Daha uzun başlıklar için daha yüksek satır
            }
            return 60; // Varsayılan satır yüksekliği
          }}
        />
      </div>
    </>
  );
}
