"use client";
import React, { useState, useEffect } from "react";
import { getTeamMembers } from "@/lib/admin/action";
import TeamMembersList from "@/components/Ekip/TeamMembersList";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  photo: string;
  about: string;
  education: any[];
  isActive: boolean;
  socialLinks: any;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getTeamMembers();

      // Backend response'ı kontrol et
      if (response && response.data && Array.isArray(response.data)) {
        setMembers(response.data);
      } else if (response && Array.isArray(response)) {
        // Eğer response direkt array ise
        setMembers(response);
      } else {
        console.warn("Unexpected response format:", response);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = (memberId: string) => {
    // Remove the deleted member from the local state
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ekip üyeleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ekip Yönetimi
            </h1>
            <p className="text-gray-600">
              Ekip üyelerini görüntüleyin, düzenleyin ve yönetin
            </p>
          </div>
          <Link
            href="/ekip/add"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Yeni Ekip Üyesi
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Üye</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Üye</p>
                <p className="text-2xl font-bold text-green-600">
                  {members.filter((m) => m.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pasif Üye</p>
                <p className="text-2xl font-bold text-gray-600">
                  {members.filter((m) => !m.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <TeamMembersList
          members={members}
          onDelete={handleDelete}
          onRefresh={fetchMembers}
        />
      </div>
    </div>
  );
}
