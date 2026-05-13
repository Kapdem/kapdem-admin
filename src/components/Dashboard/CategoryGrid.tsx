"use client";
import React from "react";

interface Category {
  category: string;
  name: string;
  count: number;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Kategoriler</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Adı
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                İçerik Sayısı
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.category}>
                <td className="px-4 py-2 text-blue-700 font-medium">
                  {cat.category}
                </td>
                <td className="px-4 py-2">{cat.name}</td>
                <td className="px-4 py-2 font-semibold text-gray-700">
                  {cat.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
