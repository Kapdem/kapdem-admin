"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { deleteNewsletter } from "@/lib/admin/data";

interface DeleteSubscriberButtonProps {
  id: string;
  email: string;
}

export default function DeleteSubscriberButton({
  id,
  email,
}: DeleteSubscriberButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `"${email}" abonesi silinecek. Bu işlem geri alınamaz.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç",
    });
    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      await deleteNewsletter(id);
      toast.success("Abone silindi");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Abone silinemedi");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {deleting ? "Siliniyor..." : "Sil"}
    </button>
  );
}
