"use client";
import React, { useState } from "react";
import { createEditor } from "@/lib/admin/action";
import {
  HiUser,
  HiLockClosed,
  HiIdentification,
  HiUserCircle,
} from "react-icons/hi2";
import { MdEmail } from "react-icons/md";

export default function EditorCreateForm() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      await createEditor(form);
      setResult("Editör başarıyla oluşturuldu!");
    } catch (err: any) {
      setResult(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100vh] w-full py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 shadow-2xl rounded-2xl p-10 w-full max-w-lg flex flex-col gap-6 border border-gray-200 backdrop-blur-md animate-fade-in"
      >
        <div className="flex flex-col items-center mb-2">
          <HiUserCircle className="text-5xl text-blue-600 mb-1" />
          <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
            Editör Oluştur
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Yeni editör hesabı oluşturmak için formu doldurun.
          </p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-gray-600 mb-4">
            Editörün sisteme kayıtlı kullanıcı adı ve e-posta adresi bulunmaması
            gerekmektedir.
          </p>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiUser className="text-lg text-blue-500" /> Kullanıcı Adı
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Kullanıcı Adı"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiLockClosed className="text-lg text-blue-500" /> Şifre
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Şifre"
              type="password"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiIdentification className="text-lg text-blue-500" /> Ad
          </label>
          <div className="relative">
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ad"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiIdentification className="text-lg text-blue-500" /> Soyad
          </label>
          <div className="relative">
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Soyad"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <MdEmail className="text-lg text-blue-500" /> Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white p-3 rounded-lg font-semibold mt-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Oluşturuluyor...
            </span>
          ) : (
            "Editör Oluştur"
          )}
        </button>

        {result && (
          <div
            className={`mt-2 text-center font-medium rounded-lg p-2 transition-all ${
              result.includes("başarı")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {result}
          </div>
        )}
      </form>
    </div>
  );
}
