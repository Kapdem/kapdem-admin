"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchUsersAction,
  sendBulkEmailAction,
  fetchNewslettersAction,
  sendBulkNewsletterEmailAction,
} from "./actions";
import Swal from "sweetalert2";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType: string;
  isActive: boolean;
}

export default function SendBulkEmailPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"users" | "subscribers">("users");

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (mode === "subscribers") fetchSubscribers();
  }, [mode]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await fetchUsersAction();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: "Kullanıcılar yüklenirken hata oluştu",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoadingSubscribers(true);
      const res = await fetchNewslettersAction();
      const list = res || [];

      const mapped = list.map((s: any) => ({
        id: s._id || s.id || s.email,
        firstName: "",
        lastName: "",
        email: s.email,
        role: "SUBSCRIBER",
        userType: "newsletter",
        isActive: !!s.isActive,
      }));

      setSubscribers(mapped);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: "Aboneler yüklenirken hata oluştu",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleSelectAll = () => {
    if (mode !== "users") return;

    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (mode !== "users") return;

    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendEmail = async () => {
    if (mode === "users" && selectedUsers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Kullanıcı Seçilmedi",
        text: "Lütfen en az bir kullanıcı seçin",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!subject.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Konu Girilmedi",
        text: "Lütfen mail konusu girin",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!emailContent.trim()) {
      Swal.fire({
        icon: "warning",
        title: "İçerik Girilmedi",
        text: "Lütfen mail içeriği girin",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Mail Gönderilsin mi?",
      html: `<strong>${selectedCount}</strong> ${mode === "users" ? "kullanıcıya" : "aboneye"} mail göndermek istediğinizden emin misiniz?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Evet, Gönder",
      cancelButtonText: "İptal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      let result: any;

      if (mode === "users") {
        result = await sendBulkEmailAction(
          subject,
          formatEmailTemplate(emailContent),
          selectedUsers,
        );
      } else {
        // newsletter bulk send: always send to all subscribers (no per-subscriber selection)
        result = await sendBulkNewsletterEmailAction(
          subject,
          formatEmailTemplate(emailContent),
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Mail Gönderimi Tamamlandı!",
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>✅ Başarılı:</strong> ${result.results?.sent ?? result.sent ?? 0}</p>
            <p class="mb-2"><strong>❌ Başarısız:</strong> ${result.results?.failed ?? result.failed ?? 0}</p>
            <p><strong>📧 Geçerli Email:</strong> ${result.validEmails ?? result.validEmails ?? (mode === "users" ? result.totalUsers : subscribers.length)}/${result.totalUsers ?? (mode === "users" ? result.totalUsers : subscribers.length)}</p>
          </div>
        `,
        confirmButtonColor: "#10b981",
      });

      // Form temizle
      setSubject("");
      setEmailContent("");
      setSelectedUsers([]);
      setSelectedSubscribers([]);
    } catch (error) {
      console.error("Error sending emails:", error);
      Swal.fire({
        icon: "error",
        title: "Hata!",
        text: "Mail gönderilirken hata oluştu",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Choose data source based on mode (users or subscribers)
  const filteredSource = mode === "users" ? users : subscribers;

  const filteredUsers = filteredSource.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      searchTerm === "" ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const isLoading = mode === "users" ? loadingUsers : loadingSubscribers;
  const selectedCount =
    mode === "users" ? selectedUsers.length : subscribers.length;

  const formatEmailTemplate = (content: string): string => {
    // Simple HTML formatting
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #2c3e50; }
            a { color: #3498db; }
          </style>
        </head>
        <body>
          <div class="container">
            ${content.replace(/\n/g, "<br>")}
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Geri Dön
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Toplu Mail Gönderimi
              </h1>
              <p className="text-gray-600 mt-1">
                Kullanıcılarınıza toplu e-posta gönderin
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setMode("users")}
                  className={`px-3 py-1 rounded-md font-medium ${mode === "users" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  Kullanıcılar
                </button>
                <button
                  onClick={() => setMode("subscribers")}
                  className={`px-3 py-1 rounded-md font-medium ${mode === "subscribers" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  Mail Aboneleri
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {mode === "users" ? "Toplam Kullanıcı" : "Toplam Abone"}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredUsers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Seçili</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {mode === "users" ? selectedUsers.length : subscribers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Seçim Oranı</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {filteredUsers.length > 0
                    ? Math.round((selectedCount / filteredUsers.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol taraf - Kullanıcı Seçimi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Kullanıcı Seçimi
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="İsim veya email ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">🏷️ Tüm Roller</option>
                  <option value="FREE">🆓 Free</option>
                  <option value="PAID">💳 Paid</option>
                  <option value="PREMIUM">⭐ Premium</option>
                </select>

                <div className="flex items-center justify-between pt-2">
                  {mode === "users" && (
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      {selectedUsers.length === filteredUsers.length
                        ? "✓ Tümünü Kaldır"
                        : "☐ Tümünü Seç"}
                    </button>
                  )}
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                    {selectedCount} / {filteredUsers.length}
                  </span>
                </div>
              </div>

              {mode === "subscribers" && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  Not: Mail abonelerine burada seçim yapılamaz — gönderim tüm
                  abonelere yapılır.
                </div>
              )}

              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">
                      {mode === "users"
                        ? "Kullanıcılar yükleniyor..."
                        : "Aboneler yükleniyor..."}
                    </p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      {mode === "users"
                        ? "Kullanıcı bulunamadı"
                        : "Abone bulunamadı"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 p-4 transition-colors group ${mode === "users" ? "hover:bg-blue-50 cursor-pointer" : ""}`}
                      >
                        {mode === "users" && (
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {user.userType}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ taraf - Mail İçeriği */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Mail İçeriği
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Konu
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Örn: Önemli Duyuru - Yeni Özellikler"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ✍️ İçerik
                  </label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Merhaba,&#10;&#10;Size önemli bir duyuru yapmak istiyoruz..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                  />
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        HTML etiketleri kullanabilirsiniz:{" "}
                        <code className="bg-amber-100 px-1 rounded">
                          &lt;b&gt;kalın&lt;/b&gt;
                        </code>
                        ,{" "}
                        <code className="bg-amber-100 px-1 rounded">
                          &lt;i&gt;italik&lt;/i&gt;
                        </code>
                        ,{" "}
                        <code className="bg-amber-100 px-1 rounded">
                          &lt;a href=""&gt;link&lt;/a&gt;
                        </code>
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={
                    loading ||
                    (mode === "users"
                      ? selectedUsers.length === 0
                      : subscribers.length === 0)
                  }
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Mail Gönder (
                      {mode === "users"
                        ? selectedUsers.length
                        : subscribers.length}
                      )
                    </>
                  )}
                </button>

                {mode === "users" && selectedUsers.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 text-center flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Mail göndermek için en az bir{" "}
                      {mode === "users" ? "kullanıcı" : "abone"} seçmelisiniz
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
