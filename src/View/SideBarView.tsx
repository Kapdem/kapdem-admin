"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AlignJustify } from "lucide-react";

export default function SideBarView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const hiddenRoutes = ["/login"];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <>
      <div className="lg:fixed lg:inset-y-0 lg:left-0 z-50">
        <Sidebar isOpen={!isClient || sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {isClient && (
        <button
          className="fixed top-4 right-4 z-50 p-2 rounded-md bg-white shadow lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Menüyü Aç"
        >
          <AlignJustify />
        </button>
      )}
    </>
  );
}
