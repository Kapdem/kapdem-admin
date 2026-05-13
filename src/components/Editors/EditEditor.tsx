"use client";
import React, { useState } from "react";

interface EditorRes {
  _id?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface EditEditorProps {
  res?: EditorRes | EditorRes[];
  onSave?: (values: {
    firstName: string;
    lastName: string;
    isActive: boolean;
  }) => void;
}

const getResObj = (res: EditEditorProps["res"]): EditorRes => {
  if (Array.isArray(res)) {
    return res[0] ?? { firstName: "", lastName: "", isActive: true };
  }
  return res ?? { firstName: "", lastName: "", isActive: true };
};

import { editEditor } from "@/lib/admin/action";

const EditEditor: React.FC<EditEditorProps> = ({ res, onSave }) => {
  const initial = getResObj(res);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // id'yi res içinden al
  const getId = () => {
    if (Array.isArray(res) && res[0]?._id) return res[0]._id;
    if (!Array.isArray(res) && res && (res as any)._id) return (res as any)._id;
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const id = getId();
      if (!id) throw new Error("ID bulunamadı");
      await editEditor(id, { firstName, lastName, isActive });
      setSuccess(true);
      if (onSave) {
        onSave({ firstName, lastName, isActive });
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100vh]  py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-gray-100 relative"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 text-blue-600 rounded-full p-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#2563eb"
                strokeWidth="1.5"
                d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 0c-3.866 0-7 2.239-7 5v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1c0-2.761-3.134-5-7-5Z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-800">
              Editör Bilgilerini Düzenle
            </h2>
            <p className="text-gray-500 text-sm">
              Editörün temel bilgilerini güncelleyin.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ad
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 shadow-sm"
              placeholder="Ad"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Soyad
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-800 shadow-sm"
              placeholder="Soyad"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
          />
          <label
            htmlFor="isActive"
            className="text-base text-gray-700 select-none"
          >
            Aktif mi?
          </label>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#dc2626"
                strokeWidth="1.5"
                d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path stroke="#16a34a" strokeWidth="1.5" d="M5 13l4 4L19 7" />
            </svg>
            Başarıyla güncellendi.
          </div>
        )}
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#fff"
                  strokeWidth="4"
                  opacity="0.2"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              Kaydediliyor...
            </span>
          ) : (
            "Kaydet"
          )}
        </button>
      </form>
    </div>
  );
};

export default EditEditor;
