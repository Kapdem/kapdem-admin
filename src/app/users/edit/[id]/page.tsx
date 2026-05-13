import UserEditForm from "@/components/Users/UserEditForm";
import React from "react";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function Page({ params }: PageProps) {
    // Await the params if using Next.js 15+ convention, 
    // though in some versions it's sync. For safety in modern Next.js:
    const { id } = await params;

    return (
        <div>
            <UserEditForm userId={id} />
        </div>
    );
}
