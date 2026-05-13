import React, { useState } from "react";
import Swal from "sweetalert2";

import { changeEditorPassword } from "@/lib/admin/action";

type Props = {
  editorId: string;
  onClose?: () => void;
};

export default function ChangePasswordPopup({ editorId, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || !repeatPassword) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Şifreyi değiştirmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Evet, değiştir",
      cancelButtonText: "Vazgeç",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await changeEditorPassword(editorId, password);
      Swal.fire("Başarılı", "Şifreniz değiştirildi.", "success");
      setPassword("");
      setRepeatPassword("");
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || "Şifre değiştirme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200">
      <div className="flex flex-col items-center py-8 px-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a6 6 0 1112 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Şifre Değiştir
          </h2>
          <p className="text-gray-500 text-sm">
            Editörün şifresini güvenli şekilde değiştirin.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <label className="flex flex-col gap-2 text-gray-700 font-medium">
            Yeni Şifre
            <input
              type="password"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Yeni şifreyi girin"
            />
          </label>
          <label className="flex flex-col gap-2 text-gray-700 font-medium">
            Şifre Tekrarı
            <input
              type="password"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Şifreyi tekrar girin"
            />
          </label>
          {error && (
            <div className="text-red-500 text-sm text-center mt-1">{error}</div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg py-3 font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-60 mt-2"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>
      </div>
    </div>
  );
}
