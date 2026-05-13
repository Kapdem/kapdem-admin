"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ChevronRight,
  Search,
  FileMusic,
  Paperclip,
  FilePlus2Icon,
  Rows4Icon,
  LogOut,
  Calendar1,
  CalendarPlus2Icon,
  CalendarRange,
  Edit,
  EditIcon,
  MailIcon,
  Mail,
  Users,
  MailCheck,
  MailPlusIcon,
} from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/auth/action";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  submenu?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
  }[];
}

const handleLogout = async () => {
  try {
    await logout();
  } catch (e) {
    // ignore
  } finally {
    // Tamamen temiz bir yükleme için location.assign
    window.location.assign("/login");
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: Home,
        label: "Ana Sayfa",
        href: "/",
      },
      {
        icon: Paperclip,
        label: "Yazılar",
        href: "/paper",
        submenu: [
          { icon: FilePlus2Icon, label: "Yazı Ekle", href: "/paper/add" },
          { icon: Rows4Icon, label: "Tüm Yazılar", href: "/paper" },
          { icon: Rows4Icon, label: "Okuma Sayısı", href: "/paper/view-stats" },
        ],
      },
      {
        icon: MailCheck,
        label: "Özel Dosyalar",
        href: "/special-files",
        submenu: [
          {
            icon: FilePlus2Icon,
            label: "Özel Dosya Ekle",
            href: "/special-files/add",
          },
          {
            icon: Rows4Icon,
            label: "Tüm Özel Dosyalar",
            href: "/special-files",
          },
        ],
      },
      {
        icon: FileMusic,
        label: "Kapdem Digital",
        href: "/digital",
        submenu: [
          {
            icon: FilePlus2Icon,
            label: "İçerik Ekle",
            href: "/digital/add",
          },
          { icon: Rows4Icon, label: "Tüm İçerikler", href: "/digital" },
        ],
      },

      {
        icon: Calendar1,
        label: "Etkinlikler",
        href: "/events",
        submenu: [
          {
            icon: CalendarPlus2Icon,
            label: "Etkinlik Ekle",
            href: "/events/add",
          },
          {
            icon: CalendarRange,
            label: "Tüm Etkinlikler",
            href: "/events",
          },
        ],
      },
      {
        icon: Paperclip,
        label: "Sizden Gelenler",
        href: "/publicsubmits",
      },
      {
        icon: Edit,
        label: "Editörler",
        href: "/editors",
        submenu: [
          {
            icon: EditIcon,
            label: "Editör Ekle",
            href: "/editors/add",
          },
          {
            icon: EditIcon,
            label: "Tüm Editörler",
            href: "/editors",
          },
        ],
      },
      {
        icon: Mail,
        label: "Mailler",
        href: "/mails",
        submenu: [
          {
            icon: MailIcon,
            label: "Tüm Mailler",
            href: "/mails",
          },
          {
            icon: MailIcon,
            label: "Mail Aboneleri",
            href: "/mails/mail-aboneleri",
          },
        ],
      },
      {
        icon: Users,
        label: "Kullanıcılar",
        href: "/users",
        submenu: [
          {
            icon: Users,
            label: "Tüm Kullanıcılar",
            href: "/users",
          },
          {
            icon: Users,
            label: "Kullanıcı Ekle",
            href: "/users/add",
          },
        ],
      },
      {
        icon: Users,
        label: "Ekip",
        href: "/ekip",
        submenu: [
          {
            icon: Users,
            label: "Tüm Ekip",
            href: "/ekip",
          },
          {
            icon: Users,
            label: "Ekip Üyesi Ekle",
            href: "/ekip/add",
          },
        ],
      },
      {
        icon: MailPlusIcon,
        label: "Toplu Mail",
        href: "/users/send-bulk-email",
      },
    ],
    []
  );

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand active menu item
  useEffect(() => {
    const activeItem = menuItems.find((item) => {
      if (pathname === item.href) return true;
      if (item.submenu) {
        return item.submenu.some((subItem) => pathname === subItem.href);
      }
      return false;
    });

    if (
      activeItem &&
      activeItem.submenu &&
      !expandedItems.includes(activeItem.label)
    ) {
      setExpandedItems((prev) => [...prev, activeItem.label]);
    }
  }, [pathname, expandedItems, menuItems]);

  // Filter menu items based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter((item) => {
        const matchesMain = item.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesSubmenu = item.submenu?.some((subItem) =>
          subItem.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesMain || matchesSubmenu;
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, menuItems]);

  const isItemActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname === href) return true;
    return false;
  };

  const isParentActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some((subItem) => pathname === subItem.href);
    }
    return false;
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const isExpanded = isOpen;

  return (
    <>
      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-white  border-r border-gray-200  text-gray-800 -all duration-300 ease-in-out z-50 w-72 lg:w-72 shadow-lg ${
          isExpanded ? "" : "max-lg:-translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200  bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Image
                  src={"/images/onlylogo.png"}
                  alt="Tula Yoga Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain rounded-full"
                />
              </div>
              <div>
                <span className="text-lg font-bold">KAPDEM</span>
                <p className="text-xs text-blue-100">Admin Paneli</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 ">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Menüde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50  border border-gray-200  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {(searchQuery ? filteredItems : menuItems).map((item) => (
              <li key={item.label}>
                <div>
                  {item.submenu ? (
                    <div>
                      <div className="flex items-center">
                        <Link href={item.href} className="flex-1">
                          <div
                            className={`flex items-center px-3 py-2.5 rounded-l-lg transition-all duration-200 group ${
                              isParentActive(item)
                                ? "bg-blue-50 /30 text-blue-700  border-r-2 border-blue-600"
                                : "hover:bg-gray-50 -800"
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 ${
                                isParentActive(item)
                                  ? "text-blue-600 "
                                  : "text-gray-500 "
                              }`}
                            />
                            <span className="text-sm font-medium ml-3 flex-1">
                              {item.label}
                            </span>
                          </div>
                        </Link>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`px-3 py-2.5 rounded-r-lg transition-all duration-200 ${
                            isParentActive(item)
                              ? "bg-blue-50 /30 text-blue-700 "
                              : "hover:bg-gray-50 -800"
                          }`}
                          aria-label={`Toggle ${item.label} submenu`}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedItems.includes(item.label)
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isItemActive(item.href)
                            ? "bg-blue-50 /30 text-blue-700  border-r-2 border-blue-600"
                            : "hover:bg-gray-50 -800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 ${
                              isItemActive(item.href)
                                ? "text-blue-600 "
                                : "text-gray-500 "
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Submenu */}
                  {item.submenu && expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-8 space-y-1 border-l-2 border-gray-200  pl-4">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.label}>
                          <Link href={subItem.href}>
                            <div
                              className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isItemActive(subItem.href)
                                  ? "bg-blue-50 /30 text-blue-700 "
                                  : "text-gray-600  hover:text-gray-900  hover:bg-gray-50 -800"
                              }`}
                            >
                              <subItem.icon
                                className={`h-4 w-4 ${
                                  isItemActive(subItem.href)
                                    ? "text-blue-600 "
                                    : "text-gray-400"
                                }`}
                              />
                              <span>{subItem.label}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        {/* Logout button truly at the bottom */}
        <div className="w-full bg-white  border-t border-gray-200  px-4 py-4 z-50 mt-auto">
          <button onClick={handleLogout} className="w-full">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors justify-start">
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
