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
import { File, Trash2 } from "lucide-react";
import { deleteParticipant } from "@/lib/posts/action";
import Swal from "sweetalert2";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Participant {
  _id: string;
  eventId: {
    _id: string;
    categories: any[];
    eventDate: string;
  };
  name: string;
  surname: string;
  phone: string;
  email: string;
  kurum: string;
  aracPlakasi: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AgGridParticipantsProps {
  participants: Participant[];
}

export default function AgGridParticipants({
  participants,
}: AgGridParticipantsProps) {
  const safeParticipantsData = Array.isArray(participants) ? participants : [];
  const [rowData, setRowData] = useState<Participant[]>(safeParticipantsData);
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);

  useEffect(() => {
    if (participants) {
      setRowData(safeParticipantsData);
    }
  }, [participants, safeParticipantsData]);

  const handleDeleteParticipant = async (participantId: string) => {
    try {
      const result = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu katılımcı kaydı kalıcı olarak silinecektir!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Evet, sil!",
        cancelButtonText: "İptal",
      });

      if (result.isConfirmed) {
        await deleteParticipant(participantId);

        // Remove the deleted participant from the local state
        setRowData((prev) => prev.filter((p) => p._id !== participantId));
        setRowCount((prev) => prev - 1);

        Swal.fire("Silindi!", "Katılımcı başarıyla silindi.", "success");
      }
    } catch (error) {
      console.error("Error deleting participant:", error);
      Swal.fire("Hata!", "Katılımcı silinirken bir hata oluştu.", "error");
    }
  };

  const columnDefs = useMemo<ColDef<Participant>[]>(
    () => [
      {
        field: "name",
        headerName: "Ad",
        flex: 1,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 150,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => (
          <div className="font-medium text-gray-800">{params.value}</div>
        ),
      },
      {
        field: "surname",
        headerName: "Soyad",
        flex: 1,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 150,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "email",
        headerName: "E-posta",
        flex: 1.5,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 200,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
        cellRenderer: (params: any) => (
          <div className="text-blue-600 underline">{params.value}</div>
        ),
      },
      {
        field: "phone",
        headerName: "Telefon",
        flex: 1,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 150,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "kurum",
        headerName: "Kurum",
        flex: 1.5,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 200,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "aracPlakasi",
        headerName: "Araç Plakası",
        flex: 1,
        filter: "agTextColumnFilter",
        sortable: true,
        minWidth: 70,
        filterParams: {
          buttons: ["reset", "apply"],
          closeOnApply: true,
        },
      },
      {
        field: "createdAt",
        headerName: "Kayıt Tarihi",
        flex: 1,
        minWidth: 150,
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
          const formattedTime = date.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          });

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
                <div className="text-xs text-gray-500">{formattedTime}</div>
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
        cellRenderer: (params: any) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteParticipant(params.value)}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              title="Katılımcıyı Sil"
            >
              <Trash2 size={16} />
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
      fileName: `Etkinlik_Katılımcıları_${
        new Date().toISOString().split("T")[0]
      }.csv`,
    });
  }, [gridApi]);

  return (
    <>
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
        />
      </div>
    </>
  );
}
