import { getAllNewsletters } from "@/lib/admin/data";
import React from "react";
import DeleteSubscriberButton from "./DeleteSubscriberButton";

type NewsletterSubscriber = {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Props = {};

export default async function page({}: Props) {
  const res = await getAllNewsletters();

  const subscribers: NewsletterSubscriber[] = res || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mail Aboneleri</h1>
          <p className="text-sm text-gray-600 mt-1">
            Toplam {subscribers.length} abone
          </p>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Güncelleme
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.length > 0 ? (
                subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriber.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subscriber.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DeleteSubscriberButton
                        id={subscriber._id}
                        email={subscriber.email}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    Henüz abone bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {subscribers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam <span className="font-medium">{subscribers.length}</span>{" "}
                abone gösteriliyor
              </div>
              <div className="text-sm text-gray-500">
                Aktif:{" "}
                <span className="font-medium text-green-600">
                  {subscribers.filter((s) => s.isActive).length}
                </span>{" "}
                | Pasif:{" "}
                <span className="font-medium text-red-600">
                  {subscribers.filter((s) => !s.isActive).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
