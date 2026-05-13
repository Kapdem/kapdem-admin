"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LinkedinIcon,
  TwitterIcon,
  MailIcon,
  GlobeIcon,
  GraduationCapIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  PowerIcon,
} from "lucide-react";
import { deleteTeamMember, toggleTeamMemberActive } from "@/lib/admin/action";
import Link from "next/link";
import Swal from "sweetalert2";

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
  isOngoing: boolean;
  _id: string;
}

interface SocialLinks {
  linkedin: string;
  twitter: string;
  email: string;
  website: string;
  _id: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  photo: string;
  about: string;
  education: Education[];
  isActive: boolean;
  socialLinks: SocialLinks;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMembersListProps {
  members: TeamMember[];
  onDelete?: (memberId: string) => void;
  onRefresh?: () => void;
}

const TeamMemberCard: React.FC<{
  member: TeamMember;
  onDelete?: (memberId: string) => void;
  onRefresh?: () => void;
}> = ({ member, onDelete, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <LinkedinIcon className="w-4 h-4" />;
      case "twitter":
        return <TwitterIcon className="w-4 h-4" />;
      case "email":
        return <MailIcon className="w-4 h-4" />;
      case "website":
        return <GlobeIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleToggleActive = async () => {
    if (isLoading) return;

    const actionText = member.isActive ? "pasif" : "aktif";
    const result = await Swal.fire({
      title: `Ekip Üyesini ${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      } Yap`,
      text: `"${member.fullName}" adlı ekip üyesini ${actionText} duruma getirmek istediğinizden emin misiniz?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: member.isActive ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Evet, ${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      } Yap`,
      cancelButtonText: "İptal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg px-6 py-2",
        cancelButton: "rounded-lg px-6 py-2",
      },
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await toggleTeamMemberActive(member.id);

      await Swal.fire({
        title: "Başarılı!",
        text: `Ekip üyesi ${actionText} duruma getirildi!`,
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Hata!",
        text: error.message || "Durum değiştirilirken hata oluştu",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/ekip/edit/${member.id}`);
  };

  const handleDelete = async () => {
    if (isLoading) return;

    const result = await Swal.fire({
      title: "Ekip Üyesini Sil",
      text: `"${member.fullName}" adlı ekip üyesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg px-6 py-2",
        cancelButton: "rounded-lg px-6 py-2",
      },
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteTeamMember(member.id);

      await Swal.fire({
        title: "Başarılı!",
        text: "Ekip üyesi başarıyla silindi!",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });

      if (onDelete) {
        onDelete(member.id);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Hata!",
        text: error.message || "Ekip üyesi silinirken hata oluştu",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Tamam",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-lg px-6 py-2",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            member.isActive
              ? "bg-green-100/80 text-green-800 border border-green-200"
              : "bg-gray-100/80 text-gray-600 border border-gray-200"
          }`}
        >
          {member.isActive ? "Aktif" : "Pasif"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleEdit}
          disabled={isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
          title="Düzenle"
        >
          <EditIcon className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleActive}
          disabled={isLoading}
          className={`p-2 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 disabled:opacity-50 ${
            member.isActive
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title={member.isActive ? "Pasif Yap" : "Aktif Yap"}
        >
          <PowerIcon className="w-4 h-4" />
        </button>

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
            title="Sil"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Image */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {!imageError ? (
          <Image
            width={400}
            height={300}
            src={member.photo}
            alt={member.fullName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <UserIcon className="w-20 h-20 text-gray-400" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Name and Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {member.fullName}
          </h2>
          <p className="text-blue-600 font-medium text-lg bg-blue-50 px-4 py-2 rounded-lg inline-block">
            {member.title}
          </p>
        </div>

        {/* About */}
        <div className="relative">
          <p
            className={`text-gray-600 leading-relaxed transition-all duration-300 ${
              isExpanded ? "" : "line-clamp-3"
            }`}
          >
            {member.about}
          </p>
          {member.about.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2 transition-colors duration-200"
            >
              {isExpanded ? "Daha az göster" : "Devamını oku..."}
            </button>
          )}
        </div>

        {/* Education */}
        {member.education.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-gray-800 font-semibold">
              <GraduationCapIcon className="w-5 h-5 text-blue-600" />
              <span>Eğitim</span>
            </div>
            <div className="space-y-2">
              {member.education.map((edu) => (
                <div
                  key={edu._id}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="font-medium text-gray-900">{edu.degree}</div>
                  <div className="text-sm text-gray-600">{edu.field}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{edu.institution}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3" />
                      <span>
                        {edu.year}
                        {edu.isOngoing ? " - Devam Ediyor" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex justify-center space-x-3 pt-4 border-t border-gray-100">
          {Object.entries(member.socialLinks).map(([platform, url]) => {
            if (!url || platform === "_id") return null;

            const isEmail = platform === "email";
            const href = isEmail ? `mailto:${url}` : url;

            return (
              <Link
                key={platform}
                href={href}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                className="group/social relative p-3 rounded-full bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
              >
                {getSocialIcon(platform)}

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/social:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  onDelete,
  onRefresh,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
        <div className="relative container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg">
            <UserIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ekip Üyeleri
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Yetenekli ve deneyimli ekip üyelerimizle tanışın
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>{members.length} Ekip Üyesi</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span>{members.filter((m) => m.isActive).length} Aktif Üye</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="container mx-auto px-4 py-12">
        {members.length === 0 ? (
          <div className="text-center py-16">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Henüz ekip üyesi bulunmuyor
            </h3>
            <p className="text-gray-500">
              Ekip üyeleri eklendiğinde burada görünecek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TeamMemberCard
                  member={member}
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersList;
