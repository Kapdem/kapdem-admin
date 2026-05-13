"use client";
import { confirmPublicStatus } from "@/lib/posts/data";
import { useState } from "react";
import { toast } from "react-toastify";

interface PublicSubmitStatusButtonProps {
  id: string;
  initialStatus: string;
}

export default function PublicSubmitStatusButton({
  id,
  initialStatus,
}: PublicSubmitStatusButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);

  const handleConfirm = async () => {
    if (!selectedStatus) {
      setError("Lütfen bir durum seçin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await confirmPublicStatus(id, selectedStatus);
      if (response && response.status) {
        setStatus(response.status);
        toast.success("Durum başarıyla güncellendi.");
        // 2 saniye delay ile yönlendir
        setTimeout(() => {
          window.location.href = "/publicsubmits";
        }, 1000);
      } else {
        setError("Durum güncellenemedi.");
        toast.error("Durum güncellenemedi.");
      }
    } catch (e) {
      setError("Bir hata oluştu.");
      toast.error("Bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex gap-2">
        <select
          className="px-2 py-1 border rounded"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={loading}
        >
          <option value="">Durum Seçin</option>
          <option value="pending">Beklemede</option>
          <option value="approved">Onayla</option>
          <option value="rejected">Reddet</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleConfirm}
          disabled={loading || !selectedStatus}
        >
          {loading ? "Güncelleniyor..." : "Durumu Güncelle"}
        </button>
      </div>
      {error && <span className="text-red-600 text-sm">{error}</span>}
      <span className="text-gray-700 text-sm">Mevcut Durum: {status}</span>
    </div>
  );
}
