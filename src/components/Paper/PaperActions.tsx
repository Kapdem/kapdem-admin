"use client";

import React, { useState } from "react";
import Link from "next/link";
import { deletePost } from "@/lib/admin/action";
import {
  makeFeaturePost,
  unmakeFeaturePost,
  makeEditorsPickPost,
  unmakeEditorsPickPost,
} from "@/lib/posts/action";
import { BookOpen, Edit, Eye, Star, Trash } from "lucide-react";
import Swal from "sweetalert2";

interface PaperActionsProps {
  id: string;
  isFeatured?: boolean;
  isEditorPick?: boolean;
}

export default function PaperActions({
  id,
  isFeatured,
  isEditorPick,
}: PaperActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);
  const [isEditorPickLoading, setIsEditorsPickLoading] = useState(false);

  const handleFeatureToggle = async () => {
    setIsFeatureLoading(true);
    try {
      let response;
      if (isFeatured) {
        response = await unmakeFeaturePost(id);
      } else {
        response = await makeFeaturePost(id, true);
      }

      if (response?.statusCode && response.statusCode !== 200) {
        throw new Error(
          response.message || "Öne çıkarma işlemi başarısız oldu.",
        );
      }

      await Swal.fire({
        title: "✅ Başarılı!",
        text: isFeatured
          ? "Yazı öne çıkarılanlardan kaldırıldı. Sayfa yenilenecek..."
          : "Yazı öne çıkarıldı. Sayfa yenilenecek...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      window.location.reload();
    } catch (error: any) {
      await Swal.fire({
        title: "❌ Hata",
        text: error.message || "Öne çıkarma işlemi başarısız oldu.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsFeatureLoading(false);
    }
  };

  const handleEditorsPickToggle = async () => {
    setIsEditorsPickLoading(true);
    try {
      let response;
      if (isEditorPick) {
        response = await unmakeEditorsPickPost(id);
      } else {
        response = await makeEditorsPickPost(id, true);
      }

      if (response?.statusCode && response.statusCode !== 200) {
        throw new Error(
          response.message || "Editörün seçimi işlemi başarısız oldu.",
        );
      }

      await Swal.fire({
        title: "✅ Başarılı!",
        text: isEditorPick
          ? "Yazı editörün seçiminden kaldırıldı. Sayfa yenilenecek..."
          : "Yazı editörün seçimine alındı. Sayfa yenilenecek...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      window.location.reload();
    } catch (error: any) {
      await Swal.fire({
        title: "❌ Hata",
        text: error.message || "Editörün seçimi işlemi başarısız oldu.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsEditorsPickLoading(false);
    }
  };

  const handleDelete = async () => {
    // SweetAlert ile modern onay dialog'u
    const result = await Swal.fire({
      title: "⚠️ DİKKAT!",
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 15px; font-weight: bold;">Bu yayını silmek istediğinizden emin misiniz?</p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;">• Bu işlem <strong>GERİ ALINAMAZ</strong></li>
            <li style="margin-bottom: 8px;">• Yayın kalıcı olarak silinecektir</li>
            <li style="margin-bottom: 8px;">• Tüm veriler kaybolacaktır</li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: `İptal`,
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "swal-wide",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deletePost(id);

      if (response && !response.statusCode) {
        // Başarılı silme - SweetAlert ile
        await Swal.fire({
          title: "✅ Başarılı!",
          text: "Yayın başarıyla silindi. Sayfa yenilenecek...",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        window.location.reload();
      } else {
        throw new Error(response?.message || "Silme işlemi başarısız");
      }
    } catch (error: any) {
      console.error("Post silme hatası:", error);

      // SweetAlert ile hata gösterimi
      let title = "❌ Hata Oluştu";
      let text = "Post silinirken bir hata oluştu.";
      let icon: "error" | "warning" = "error";

      // Hata tipine göre özel mesajlar
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
          title = "📄 Post Bulunamadı";
          text =
            "Bu post zaten silinmiş olabilir veya mevcut değil. Sayfa yenilenecek.";
          icon = "warning";
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleFeatureToggle}
        disabled={isFeatureLoading}
        className={`p-1.5 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isFeatured
            ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
            : "bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-700"
        }`}
        title={isFeatured ? "Öne çıkarılmışlardan kaldır" : "Öne çıkar"}
      >
        <Star className={`w-4 h-4 ${isFeatured ? "fill-yellow-700" : ""}`} />
      </button>
      <button
        onClick={handleEditorsPickToggle}
        disabled={isEditorPickLoading}
        className={`p-1.5 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isEditorPick
            ? "bg-purple-400 text-purple-900 hover:bg-purple-500"
            : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-700"
        }`}
        title={
          isEditorPick ? "Editörün seçiminden kaldır" : "Editörün seçimi yap"
        }
      >
        <BookOpen
          className={`w-4 h-4 ${isEditorPick ? "fill-purple-700" : ""}`}
        />
      </button>
      <Link
        href={`/paper/${id}`}
        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        title="Yayını görüntüle"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/paper/${id}/edit`}
        className="p-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
        title="Yayını düzenle"
      >
        <Edit className="w-4 h-4" />
      </Link>

      <button
        onClick={handleDelete}
        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Yayını sil (Geri alınamaz)"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <Trash className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
