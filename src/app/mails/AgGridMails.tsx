"use client";
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
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

ModuleRegistry.registerModules([AllCommunityModule]);

interface Mail {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface AgGridMailsProps {
  mails: Mail[];
}

export default function AgGridMails({ mails }: AgGridMailsProps) {
  const safeMailsData = Array.isArray(mails) ? mails : [];
  const [rowData, setRowData] = useState<Mail[]>(safeMailsData);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);

  useEffect(() => {
    if (Array.isArray(mails)) {
      setRowData(mails);
    }
  }, [mails]);

  const columnDefs = useMemo<ColDef<Mail>[]>(
    () => [
      {
        headerName: "Ad Soyad",
        field: "firstName",
        flex: 1.2,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 120,
        valueGetter: (params: any) => {
          const { firstName, lastName } = params.data;
          return [firstName, lastName].filter(Boolean).join(" ");
        },
        cellRenderer: (params: any) => (
          <span className="font-medium text-gray-800">{params.value}</span>
        ),
      },
      {
        field: "email",
        headerName: "E-posta",
        flex: 1.5,
        minWidth: 180,
        filter: "agTextColumnFilter",
        sortable: true,
        cellRenderer: (params: any) => (
          <a
            href={`mailto:${params.value}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {params.value}
          </a>
        ),
      },
      {
        field: "subject",
        headerName: "Konu",
        flex: 1.5,
        minWidth: 150,
        filter: "agTextColumnFilter",
        sortable: true,
        cellRenderer: (params: any) => (
          <span className="text-gray-700">{params.value}</span>
        ),
      },
      {
        field: "message",
        headerName: "Mesaj",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => (
          <span className="text-gray-600 line-clamp-2" title={params.value}>
            {params.value}
          </span>
        ),
      },
      {
        field: "createdAt",
        headerName: "Tarih",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params: any) =>
          new Date(params.value).toLocaleString("tr-TR"),
        filter: "agDateColumnFilter",
        sortable: true,
        cellRenderer: (params: any) => {
          const date = new Date(params.value);
          const formattedDate = date.toLocaleString("tr-TR");
          return <span className="text-gray-500">{formattedDate}</span>;
        },
      },
      {
        headerName: "",
        colId: "actions",
        pinned: "right",
        width: 120,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: any) => (
          <button
            onClick={() => setSelectedMail(params.data)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Görüntüle
          </button>
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
        cursor: "pointer",
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

  const onRowClicked = useCallback((event: any) => {
    // Satırın herhangi bir yerine tıklanınca mail detayını aç
    setSelectedMail(event.data);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      gridApi?.sizeColumnsToFit();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMail(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onExportCSV = useCallback(() => {
    gridApi?.exportDataAsCsv({
      fileName: `Mailler_${new Date().toISOString().split("T")[0]}.csv`,
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
          pagination={true}
          paginationPageSize={15}
          paginationPageSizeSelector={[15, 25, 50, 100]}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onRowClicked={onRowClicked}
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
            const msg = params.data.message || "";
            if (msg.length > 70) {
              return 80;
            }
            return 60;
          }}
        />
      </div>

      {selectedMail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-800 break-words">
                  {selectedMail.subject || "(Konu belirtilmemiş)"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedMail.createdAt
                    ? new Date(selectedMail.createdAt).toLocaleString("tr-TR")
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="ml-4 text-2xl leading-none text-gray-400 hover:text-gray-600"
                aria-label="Kapat"
              >
                &times;
              </button>
            </div>

            {/* İçerik */}
            <div className="px-6 py-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-xs font-medium uppercase text-gray-400">
                    Gönderen
                  </span>
                  <span className="text-sm text-gray-800">
                    {[selectedMail.firstName, selectedMail.lastName]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium uppercase text-gray-400">
                    E-posta
                  </span>
                  <a
                    href={`mailto:${selectedMail.email}`}
                    className="text-sm text-blue-600 underline hover:text-blue-800 break-all"
                  >
                    {selectedMail.email}
                  </a>
                </div>
              </div>
              <span className="block text-xs font-medium uppercase text-gray-400 mb-1">
                Mesaj
              </span>
              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 rounded-lg p-4 border border-gray-200">
                {selectedMail.message || "(Mesaj içeriği boş)"}
              </div>
            </div>

            {/* Alt butonlar */}
            <div className="flex justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-gray-50">
              <a
                href={`mailto:${selectedMail.email}?subject=${encodeURIComponent(
                  "Re: " + (selectedMail.subject || "")
                )}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Yanıtla
              </a>
              <button
                onClick={() => setSelectedMail(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
