"use client";
import React, { useState } from "react";
import { createUser } from "@/lib/admin/action";
import {
  HiUser,
  HiLockClosed,
  HiIdentification,
  HiUserCircle,
} from "react-icons/hi2";
import { MdEmail, MdSchool } from "react-icons/md";
import { FaUserTag, FaUserCheck } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function UserCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    role: "FREE",
    userType: "REGULAR",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(form);
      toast.success("Kullanıcı başarıyla oluşturuldu!", {
        position: "top-right",
        autoClose: 3000,
      });
      // Kullanıcıları listeleme sayfasına yönlendir
      router.push("/users");
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100vh] w-full py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 shadow-2xl rounded-2xl p-10 w-full max-w-6xl flex flex-col gap-6 border border-gray-200 backdrop-blur-md animate-fade-in"
      >
        <div className="flex flex-col items-center mb-2">
          <HiUserCircle className="text-5xl text-blue-600 mb-1" />
          <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
            Kullanıcı Oluştur
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Yeni kullanıcı hesabı oluşturmak için formu doldurun.
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
              required
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
              required
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
              required
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
              required
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
              required
            />
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Institution */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="institution"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <MdSchool className="text-lg text-blue-500" /> Kurum
          </label>
          <div className="relative">
            <input
              id="institution"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="Kurum"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              autoComplete="off"
            />
            <MdSchool className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="role"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <FaUserTag className="text-lg text-blue-500" /> Rol
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              required
            >
              <option value="FREE">FREE</option>
              <option value="PAID">PAID</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
            <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* User Type */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="userType"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <FaUserCheck className="text-lg text-blue-500" /> Kullanıcı Tipi
          </label>
          <div className="relative">
            <select
              id="userType"
              name="userType"
              value={form.userType}
              onChange={handleChange}
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
              required
            >
              <option value="REGULAR">REGULAR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <FaUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-700 transition-all text-white p-3 rounded-lg font-semibold mt-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <VscLoading className="animate-spin text-xl" />
              Oluşturuluyor...
            </span>
          ) : (
            "Kullanıcı Oluştur"
          )}
        </button>
      </form>
    </div>
  );
}
