"use client";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import React from "react";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { deleteEditor } from "@/lib/admin/action";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Editor {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailConfirmed: boolean;
  role: string;
  username: string;
  createdBy: string;
  isAdminUser: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastLoginAt?: string;
}

interface EditorsGridProps {
  editors: Editor[];
}

import { ColDef } from "ag-grid-community";
import Link from "next/link";
import { Edit, Fingerprint, Trash } from "lucide-react";
import ChangePasswordPopup from "./ChangePasswordPopup";

ModuleRegistry.registerModules([AllCommunityModule]);

const EditorsGrid: React.FC<EditorsGridProps> = ({ editors }) => {
  const router = useRouter();
  const [passwordPopup, setPasswordPopup] = useState<{
    open: boolean;
    editorId: string | null;
  }>({ open: false, editorId: null });
  // Sayaçlar
  const totalEditors = editors.length;
  const activeEditors = editors.filter((e) => e.isActive).length;
  const adminEditors = editors.filter((e) => e.isAdminUser).length;

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu editörü silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteEditor(id);
      router.refresh?.();
      if (!router.refresh) window.location.reload();
    } catch (e: any) {
      Swal.fire("Hata", e?.message || "Silme işlemi başarısız oldu.", "error");
    }
  };

  const columnDefs = [
    {
      headerName: "Ad",
      field: "firstName" as keyof Editor,
      minWidth: 120,
      maxWidth: 200,
      resizable: true,
    },
    {
      headerName: "Soyad",
      field: "lastName" as keyof Editor,
      minWidth: 120,
      maxWidth: 200,
      resizable: true,
    },
    {
      headerName: "Kullanıcı Adı",
      field: "username" as keyof Editor,
      minWidth: 140,
      maxWidth: 220,
      resizable: true,
    },
    {
      headerName: "Email",
      field: "email" as keyof Editor,
      minWidth: 180,
      maxWidth: 320,
      resizable: true,
    },
    // {
    //   headerName: "Aktif mi?",
    //   field: "isActive" as keyof Editor,
    //   flex: 1,
    //   cellRenderer: (params: any) => (params.value ? "Evet" : "Hayır"),
    // },
    // {
    //   headerName: "Email Onaylı?",
    //   field: "isEmailConfirmed" as keyof Editor,
    //   flex: 1,
    //   cellRenderer: (params: any) => (params.value ? "Evet" : "Hayır"),
    // },
    {
      headerName: "Admin?",
      field: "isAdminUser" as keyof Editor,
      minWidth: 90,
      maxWidth: 120,
      resizable: true,
      cellRenderer: (params: any) => (params.value ? "Evet" : "Hayır"),
    },
    {
      headerName: "Rol",
      field: "role" as keyof Editor,
      minWidth: 90,
      maxWidth: 140,
      resizable: true,
    },
    {
      headerName: "Oluşturulma",
      field: "createdAt" as keyof Editor,
      minWidth: 150,
      maxWidth: 200,
      resizable: true,
      valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
    },
    {
      headerName: "Son Giriş",
      field: "lastLoginAt" as keyof Editor,
      minWidth: 150,
      maxWidth: 200,
      resizable: true,
      valueFormatter: (params: any) =>
        params.value ? new Date(params.value).toLocaleString() : "-",
    },
    {
      headerName: "İşlemler",
      field: "_id",
      minWidth: 140,
      maxWidth: 180,
      resizable: true,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/editors/edit/${params.data._id}`);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.data._id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            <Trash size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPasswordPopup({ open: true, editorId: params.data._id });
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-zinc-500 text-white rounded hover:bg-zinc-600 text-xs"
          >
            <Fingerprint size={14} />
          </button>
        </div>
      ),
      sortable: false,
      filter: false,
    },
  ] as ColDef<Editor>[];

  return (
    <div className="w-full max-w-7xl my-12 mx-auto">
      {passwordPopup.open && passwordPopup.editorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setPasswordPopup({ open: false, editorId: null })}
            >
              ×
            </button>
            <ChangePasswordPopup
              editorId={passwordPopup.editorId}
              onClose={() => setPasswordPopup({ open: false, editorId: null })}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[180px] bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-blue-700">
            {totalEditors}
          </span>
          <span className="text-gray-700 text-sm mt-1">Toplam Editör</span>
        </div>
        <div className="flex-1 min-w-[180px] bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-green-700">
            {activeEditors}
          </span>
          <span className="text-gray-700 text-sm mt-1">Aktif Editör</span>
        </div>
        <div className="flex-1 min-w-[180px] bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-yellow-700">
            {adminEditors}
          </span>
          <span className="text-gray-700 text-sm mt-1">Admin Editör</span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          <p className="text-2xl md:text-lg font-bold">Editör Listesi</p>
        </div>
        <Link
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          href={"/editors/add"}
        >
          Yeni Editör Ekle
        </Link>
      </div>
      <div className="w-full h-[70vh] ag-theme-material rounded-lg overflow-x-auto border border-gray-200 shadow-sm">
        <style>{`
        .ag-theme-material .ag-header {
          background: #f9fafb;
          font-weight: 500;
          font-size: 0.97rem;
          color: #22223b;
          border-bottom: 1px solid #e5e7eb;
        }
        .ag-theme-material .ag-row {
          font-size: 0.93rem;
          line-height: 1.35;
          min-height: 36px !important;
          max-height: 36px !important;
        }
        .ag-theme-material .ag-cell {
          padding-top: 4px !important;
          padding-bottom: 4px !important;
          padding-left: 8px !important;
          padding-right: 8px !important;
          white-space: nowrap;
        }
        .ag-theme-material .ag-row:nth-child(even) {
          background: #f6f8fa;
        }
        .ag-theme-material .ag-row:hover {
          background: #e0e7ff !important;
        }
        .ag-theme-material .ag-root-wrapper {
          border-radius: 0.75rem;
        }
        @media (max-width: 900px) {
          .ag-theme-material .ag-header, .ag-theme-material .ag-row {
            font-size: 0.89rem;
          }
        }
      `}</style>
        <AgGridReact
          rowData={editors}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={15}
          paginationPageSizeSelector={[15, 25, 50, 100]}
          domLayout="autoHeight"
          rowHeight={36}
          headerHeight={36}
          rowClass="hover:bg-blue-50"
          suppressCellFocus={true}
          enableCellTextSelection={true}
          overlayNoRowsTemplate={
            "<div class='p-4 text-gray-500 flex flex-col items-center'><svg xmlns='http://www.w3.org/2000/svg' class='h-10 w-10 mb-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg><span>Gösterilecek kayıt bulunamadı</span></div>"
          }
          getRowHeight={() => 36}
          onGridReady={(params) => {
            setTimeout(() => {
              params.api.sizeColumnsToFit();
              params.api.autoSizeAllColumns && params.api.autoSizeAllColumns();
            }, 100);
          }}
        />
      </div>
    </div>
  );
};

export default EditorsGrid;
