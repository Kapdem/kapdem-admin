"use client";

import React, { useState, useEffect } from "react";
import { getAllSpecialFile } from "@/lib/special-files/data";
import { deleteSpecialFile } from "@/lib/special-files/action";
import Link from "next/link";
import { Trash2, Eye, Edit, FileText } from "lucide-react";
import Swal from "sweetalert2";

export default function Page() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await getAllSpecialFile();
      setFiles(data || []);
    } catch (error) {
      console.error("Dosyalar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Özel Dosyayı Sil",
      text: `"${title}" dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg px-6 py-2",
        cancelButton: "rounded-lg px-6 py-2",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await deleteSpecialFile(id);
      setFiles((prev) => prev.filter((file) => file._id !== id));

      await Swal.fire({
        title: "Başarılı!",
        text: "Özel dosya başarıyla silindi!",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });
    } catch (error: any) {
      await Swal.fire({
        title: "Hata!",
        text: error.message || "Dosya silinirken bir hata oluştu.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dosyalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Özel Dosyalar</h1>
        <Link
          href="/special-files/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yeni Ekle
        </Link>
      </div>

      {!files || files.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
          Henüz özel dosya bulunmuyor.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file: any) => (
                <tr key={file._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {file.translations?.tr?.title ||
                        file.title ||
                        "Başlıksız"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {file.translations?.tr?.slug || file.slug || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        file.status === "publish"
                          ? "bg-green-100 text-green-800"
                          : file.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {file.accessTier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/special-files/${file._id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/special-files/edit/${file._id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            file._id,
                            file.translations?.tr?.title ||
                              file.title ||
                              "Başlıksız"
                          )
                        }
                        disabled={deletingId === file._id}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sil"
                      >
                        {deletingId === file._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
