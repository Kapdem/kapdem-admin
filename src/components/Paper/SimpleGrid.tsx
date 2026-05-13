"use client";

import React from "react";
import Link from "next/link";

// Define the Post interface based on the sample data
interface Author {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Post {
  id: string;
  title?: string;
  translations?: {
    tr?: {
      title?: string;
      slug?: string;
    };
    en?: {
      title?: string;
      slug?: string;
    };
  };
  slug: string;
  accessTier: string;
  publishedAt: string;
  author: Author;
  lastEdited: string | null;
}

interface SimpleGridProps {
  posts: Post[];
}

// Erişim Düzeyi için renk kodları ve çeviriler
const accessTierMap: Record<string, { color: string; label: string }> = {
  FREE: { color: "bg-gray-100 text-gray-800", label: "Ücretsiz İçerik" },
  PAID: { color: "bg-blue-100 text-blue-800", label: "Ücretli İçerik" },
  PREMIUM: { color: "bg-purple-100 text-purple-800", label: "Premium İçerik" },
  ADMIN: { color: "bg-green-100 text-green-800", label: "Admin Erişimi" },
  EDITOR: { color: "bg-yellow-100 text-yellow-800", label: "Editör Erişimi" },
  SUPER_ADMIN: {
    color: "bg-red-100 text-red-800",
    label: "Süper Admin Erişimi",
  },
};

export default function SimpleGrid({ posts }: SimpleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => {
        const date = new Date(post.publishedAt).toLocaleDateString("tr-TR");
        const tier = post.accessTier || "PAID";
        const { color, label } = accessTierMap[tier] || {
          color: "bg-gray-100 text-gray-800",
          label: post.accessTier,
        };
        
        // Çoklu dil desteği: önce translations.tr.title, sonra eski title
        const title = post.translations?.tr?.title || post.title || "";

        return (
          <div
            key={post.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-800 line-clamp-2">
                  {title}
                </h3>
                <span
                  className={`ml-2 px-2 py-1 rounded-full ${color} text-xs font-medium whitespace-nowrap`}
                >
                  {label}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>
                    {post.author
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : "Bilinmeyen Yazar"}
                  </span>
                </div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{date}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Link
                  href={`/paper/${post.id}`}
                  className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Görüntüle
                </Link>
                <Link
                  href={`/paper/${post.id}/edit`}
                  className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  Düzenle
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
