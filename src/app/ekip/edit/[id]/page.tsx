"use client";
import React from "react";
import { useRouter } from "next/navigation";
import TeamMemberEditForm from "@/components/Ekip/TeamMemberEditForm";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditTeamMemberPage({ params }: PageProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to team members list using Next.js router
    router.push("/ekip");
  };

  const handleCancel = () => {
    // Redirect back to team members list
    router.push("/ekip");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/ekip"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Ekip Listesine Dön
          </Link>
        </div>

        {/* Edit Form */}
        <TeamMemberEditForm
          memberId={params.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
