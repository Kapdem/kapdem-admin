"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth/action";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const toastId = toast.loading("Giriş yapılıyor...");
    try {
      const response = await login(email, password);

      if (response && response.accessToken) {
        toast.update(toastId, {
          render: "Giriş başarılı. Yönlendiriliyorsunuz...",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        const target =
          redirectParam && redirectParam !== "" ? redirectParam : "/";
        // Küçük bir gecikme ile yönlendirme (toast kullanıcıya gösterilsin)
        setTimeout(() => router.push(target), 400);
      } else {
        const message =
          response?.message ||
          "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
        setError(message);
        toast.update(toastId, {
          render: message,
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const message =
        err?.message ||
        "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
      setError(message);
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-gray-900">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 relative">
        <Image
          src="/images/workplace-objects.jpg"
          alt="Kapdem Logo"
          fill
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="absolute bottom-10 left-10 text-white z-20 max-w-md">
          <h1 className="text-3xl font-bold mb-3">KAPDEM Yönetim Paneli</h1>
          <p className="text-gray-300">
            Kapdem yönetim paneline hoş geldiniz. Tüm içeriklerinizi buradan
            yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logotext.png"
                alt="Kapdem Logo"
                width={1920}
                height={1080}
                className="object-contain w-7/12 h-auto"
              />
            </div>
            <p className="text-gray-400 mt-2">Yönetim paneline giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                E-posta
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                placeholder="admin@kapdem.org"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                  placeholder="Şifreniz"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Şifrenizi mi unuttunuz?</p>
            <p className="mt-1">Yardım için yönetici ile iletişime geçin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
