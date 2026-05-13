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
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { deletePublicSubmit } from "@/lib/admin/action";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  GridApi,
  GridReadyEvent,
  FilterChangedEvent,
} from "ag-grid-community";
import { File } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PublicSubmit {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  institution: string;
  title: string;
  category: string;
  email: string;
  summary: string;
  content: string;
  biografi: string;
  status: string;
  submittedAt: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AgGridPublicSubmitsProps {
  submits: PublicSubmit[];
}

const statusMap: Record<
  string,
  { color: string; label: string; bgColor: string }
> = {
  pending: {
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
    label: "Beklemede",
  },
  approved: {
    color: "text-green-800",
    bgColor: "bg-green-100",
    label: "Onaylandı",
  },
  rejected: {
    color: "text-red-800",
    bgColor: "bg-red-100",
    label: "Reddedildi",
  },
};

const categoryMap: Record<string, string> = {
  "dijital-perspektif": "Dijital Perspektif",
  ekonomi: "Ekonomi",
  egitim: "Eğitim",
  "dis-politika": "Dış Politika",
  "ic-politika": "İç Politika",
  toplum: "Toplum",
  kultur: "Kültür",
  "": "Belirtilmemiş",
};

export default function AgGridPublicSubmits({
  submits,
}: AgGridPublicSubmitsProps) {
  const safeSubmitsData = Array.isArray(submits) ? submits : [];
  const [rowData, setRowData] = useState<PublicSubmit[]>(safeSubmitsData);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);

  useEffect(() => {
    if (submits) {
      setRowData(submits);
    }
  }, [submits]);

  const columnDefs = useMemo<ColDef<PublicSubmit>[]>(
    () => [
      {
        field: "title",
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
        cellRenderer: (params: any) => (
          <div
            className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
            title={params.value}
          >
            {params.value}
          </div>
        ),
        cellStyle: {
          display: "flex",
          alignItems: "center",
          padding: "12px 8px",
          whiteSpace: "normal",
          lineHeight: "1.4",
        },
      },
      {
        headerName: "Yazar",
        flex: 1,
        minWidth: 150,
        valueGetter: (params: any) => {
          return `${params.data.firstName} ${params.data.lastName}`;
        },
        filter: "agTextColumnFilter",
        sortable: true,
        wrapText: false,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => {
          const authorName = `${params.data.firstName} ${params.data.lastName}`;
          return (
            <div className="flex items-center">
              <div className="min-w-[2rem] w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-2">
                {authorName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <span className="text-gray-700 truncate">{authorName}</span>
            </div>
          );
        },
      },
      {
        field: "category",
        headerName: "Kategori",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: any) => {
          const category = params.value || "";
          return (
            <div className="text-gray-700">
              {categoryMap[category] || "Belirtilmemiş"}
            </div>
          );
        },
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        field: "institution",
        headerName: "Kurum",
        flex: 1,
        minWidth: 150,
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        field: "status",
        headerName: "Durum",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const status = params.value || "pending";
          const { color, bgColor, label } = statusMap[status] || {
            color: "text-gray-800",
            bgColor: "bg-gray-100",
            label: params.value,
          };
          return (
            <div
              className={`flex items-center ${bgColor} ${color} px-3 py-1 rounded-full`}
            >
              <span className="text-xs font-medium">{label}</span>
            </div>
          );
        },
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        field: "submittedAt",
        headerName: "Gönderim Tarihi",
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
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          let dateLabel = "";
          if (daysDiff === 0) dateLabel = "Bugün";
          else if (daysDiff === 1) dateLabel = "Dün";
          else if (daysDiff < 7) dateLabel = `${daysDiff} gün önce`;
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
        minWidth: 120,
        sortable: false,
        filter: false,
        cellClass: "action-cell",
        headerClass: "action-header",
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <a
              href={`/publicsubmits/${params.value}`}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              rel="noopener noreferrer"
            >
              Görüntüle
            </a>
            <a
              href={`/api/publicsubmits/download/${params.value}`}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              rel="noopener noreferrer"
            >
              İndir
            </a>
            <button
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              onClick={async (e) => {
                e.preventDefault();
                const result = await Swal.fire({
                  title: "Emin misiniz?",
                  text: "Bu başvuruyu silmek istediğinize emin misiniz?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Evet, sil!",
                  cancelButtonText: "Vazgeç",
                });
                if (result.isConfirmed) {
                  try {
                    await deletePublicSubmit(params.value);
                    toast.success("Başvuru başarıyla silindi.");
                    setRowData((prev) =>
                      prev.filter((row) => row._id !== params.value)
                    );
                  } catch (err: any) {
                    toast.error(err?.message || "Silme işlemi başarısız oldu.");
                  }
                }
              }}
            >
              Sil
            </button>
          </div>
        ),
      },
    ],
    []
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
    []
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridApi(params.api);
      params.api.sizeColumnsToFit();
      setRowCount(params.api.getDisplayedRowCount());
    },
    [rowData]
  );

  const onFilterChanged = useCallback(
    (event: FilterChangedEvent) => {
      if (gridApi) {
        setRowCount(gridApi.getDisplayedRowCount());
      }
    },
    [gridApi]
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
      fileName: `Başvurular_${new Date().toISOString().split("T")[0]}.csv`,
      processCellCallback: (params) => {
        if (params.column.getColId() === "status" && params.value) {
          const status = params.value;
          return statusMap[status]?.label || params.value;
        }
        if (params.column.getColId() === "category" && params.value) {
          return categoryMap[params.value] || params.value;
        }
        if (
          params.column.getColId() === "_firstName" ||
          params.column.getColId() === "_lastName"
        ) {
          return params.value;
        }
        return params.value;
      },
    });
  }, [gridApi]);

  return (
    <>
      <div className="max-w-7xl w-full mx-auto mb-4 my-12">
        <p className="text-2xl font-bold">Gelen Başvurular</p>
      </div>
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
      <div className="max-w-7xl mx-auto w-full h-[500px] ag-theme-material rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
