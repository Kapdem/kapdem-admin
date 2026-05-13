import { publicSubmitById } from "@/lib/posts/data";
import React from "react";
import Link from "next/link";
import PublicSubmitStatusButton from "@/components/PublicSubmitStatusButton";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const submit = await publicSubmitById("68c0884a28821db0bdefe7ab");

  if (!submit) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <h1 className="text-2xl font-bold text-red-600">Başvuru bulunamadı</h1>
        <p className="mt-4">Bu ID'ye sahip bir başvuru bulunamadı.</p>
        <Link
          href="/publicsubmits"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Başvuru Listesine Dön
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMap: Record<
    string,
    { color: string; bg: string; label: string }
  > = {
    pending: {
      color: "text-yellow-800",
      bg: "bg-yellow-100",
      label: "Beklemede",
    },
    approved: {
      color: "text-green-800",
      bg: "bg-green-100",
      label: "Onaylandı",
    },
    rejected: { color: "text-red-800", bg: "bg-red-100", label: "Reddedildi" },
  };

  const categoryMap: Record<string, string> = {
    "dijital-perspektif": "Dijital Perspektif",
    ekonomi: "Ekonomi",
    egitim: "Eğitim",
    "dis-politika": "Dış Politika",
    "ic-politika": "İç Politika",
    toplum: "Toplum",
    kultur: "Kültür",
    "": "Belirtilmemiş",
  };

  const status = submit.status || "pending";
  const { color, bg, label } = statusMap[status];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{submit.title}</h1>
        <div className={`px-3 py-1 rounded-full ${bg} ${color}`}>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Yazar Bilgileri
            </h2>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">
                {submit.firstName} {submit.lastName}
              </p>
              <p className="text-gray-600">{submit.email}</p>
              <p className="text-gray-600">{submit.phone}</p>
              <p className="text-gray-600">{submit.institution}</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Kategori</h2>
            <p className="mt-2 text-gray-700">
              {categoryMap[submit.category] || "Belirtilmemiş"}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Gönderim Bilgileri
            </h2>
            <div className="mt-2 text-gray-700">
              <p>Tarih: {formatDate(submit.submittedAt)}</p>
              <p>IP Adresi: {submit.ipAddress}</p>
              <p>Tarayıcı: {submit.userAgent}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500">
            Yazarın Kısa Biyografisi
          </h2>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {submit.biografi}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Özet</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{submit.summary}</p>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">İçerik</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{submit.content}</p>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center ">
        <Link
          href="/publicsubmits"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Listeye Dön
        </Link>
        <PublicSubmitStatusButton id={id} initialStatus={status} />
      </div>
    </div>
  );
}
