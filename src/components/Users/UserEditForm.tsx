"use client";
import React, { useState, useEffect } from "react";
import { updateUser } from "@/lib/admin/action";
import { getUserById } from "@/lib/admin/data";
import {
  HiUser,
  HiLockClosed,
  HiIdentification,
  HiUserCircle,
  HiDocumentText,
} from "react-icons/hi2";
import { MdEmail, MdSchool, MdPhoto, MdCameraAlt } from "react-icons/md";
import { FaUserTag, FaUserCheck, FaToggleOn } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function UserEditForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    title: "",
    profession: "",
    role: "FREE",
    userType: "REGULAR",
    photo: "",
    about: "",
    isActive: true,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(userId);

        const userData = res.user || res; // Check for .user property as per backend response
        if (userData) {
          setForm({
            username: userData.username || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            institution: userData.institution || "",
            title: userData.title || "",
            profession: userData.profession || "",
            role: userData.role || userData.tier || "FREE",
            userType: userData.userType || "REGULAR",
            photo: userData.photo || userData.profilePicture || "",
            about: userData.about || "",
            isActive:
              userData.isActive !== undefined ? userData.isActive : true,
          });
        }
      } catch (err: any) {
        toast.error("Kullanıcı bilgileri yüklenemedi.");
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("institution", form.institution);
      formData.append("title", form.title);
      formData.append("profession", form.profession);
      formData.append("role", form.role);
      formData.append("userType", form.userType);
      formData.append("about", form.about);
      formData.append("isActive", String(form.isActive));
      form;

      if (photo) {
        formData.append("photo", photo);
      } else if (form.photo) {
        formData.append("photo", form.photo); // keep existing URL
      }

      await updateUser(userId, formData);
      toast.success("Kullanıcı başarıyla güncellendi!", {
        position: "top-right",
        autoClose: 3000,
      });
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

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <VscLoading className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[100vh] w-full py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 shadow-2xl rounded-2xl p-10 w-full max-w-6xl flex flex-col gap-6 border border-gray-200 backdrop-blur-md animate-fade-in"
      >
        <div className="flex flex-col items-center mb-2">
          <HiUserCircle className="text-5xl text-blue-600 mb-1" />
          <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
            Kullanıcı Düzenle
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Kullanıcı bilgilerini güncellemek için formu düzenleyin.
          </p>
        </div>

        {/* Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="title"
              className="font-medium text-gray-700 flex items-center gap-2"
            >
              <HiIdentification className="text-lg text-blue-500" /> Unvan
            </label>
            <div className="relative">
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Örn: Doç. Dr."
                className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
                autoComplete="off"
              />
              <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Profession */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="profession"
              className="font-medium text-gray-700 flex items-center gap-2"
            >
              <HiIdentification className="text-lg text-blue-500" /> Uzmanlık
              Alanı
            </label>
            <div className="relative">
              <input
                id="profession"
                name="profession"
                value={form.profession}
                onChange={handleChange}
                placeholder="Örn: Kardiyoloji"
                className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm"
                autoComplete="off"
              />
              <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Profile Picture */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <MdPhoto className="text-lg text-blue-500" /> Profil Fotoğrafı
            </label>
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              {(photoPreview || form.photo) && (
                <div className="relative w-24 h-24">
                  <img
                    src={photoPreview || form.photo}
                    alt="Profil Önizleme"
                    className="w-full h-full object-cover rounded-full border-2 border-blue-200 shadow-sm"
                  />
                </div>
              )}
              <div className="relative w-full">
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="flex items-center justify-center gap-2 w-full p-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all font-medium text-sm text-gray-600 shadow-sm"
                >
                  <MdCameraAlt className="text-lg" />
                  {photo ? "Fotoğraf Değiştir" : "Fotoğraf Seç"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* About / Bio */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="about"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiDocumentText className="text-lg text-blue-500" /> Hakkımda /
            Biyografi
          </label>
          <textarea
            id="about"
            name="about"
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="Yazar hakkında kısa bilgi..."
            rows={4}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white shadow-sm resize-vertical"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="role"
              className="font-medium text-gray-700 flex items-center gap-2"
            >
              <FaUserTag className="text-lg text-blue-500" /> Rol / Tier
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
                <option value="VIP">VIP</option>
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
                <option value="AUTHOR">AUTHOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
              <FaUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <label
            htmlFor="isActive"
            className="font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
          >
            <FaToggleOn
              className={`text-xl ${form.isActive ? "text-green-500" : "text-gray-400"}`}
            />
            Hesap Durumu (Aktif/Pasif)
          </label>
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange}
            className="w-5 h-5 cursor-pointer accent-blue-600"
          />
          <span
            className={`text-sm font-semibold ${form.isActive ? "text-green-600" : "text-red-600"}`}
          >
            {form.isActive ? "AKTİF" : "PASİF"}
          </span>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-blue-700 transition-all text-white p-3 rounded-lg font-semibold mt-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <VscLoading className="animate-spin text-xl" />
                Güncelleniyor...
              </span>
            ) : (
              "Güncelle"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/users")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 transition-all text-gray-800 p-3 rounded-lg font-semibold mt-2 shadow-md text-lg tracking-wide"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
