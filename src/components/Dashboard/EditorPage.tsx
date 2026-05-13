import React from "react";
import {
  HiDocumentText,
  HiUserGroup,
  HiPencilAlt,
  HiCalendar,
  HiPlusCircle,
} from "react-icons/hi";

const editorTasks = [
  {
    icon: <HiDocumentText className="text-blue-600 w-7 h-7" />, // İçerik ekle
    title: "Yazı Ekle",
    description: "Yeni bir yazı oluşturabilir ve yayınlayabilirsin.",
    href: "/paper/add",
  },
  {
    icon: <HiPencilAlt className="text-indigo-600 w-7 h-7" />, // İçerik düzenle
    title: "Yazıları Düzenle",
    description: "Mevcut yazıları düzenleyebilir veya silebilirsin.",
    href: "/paper",
  },
  {
    icon: <HiCalendar className="text-green-600 w-7 h-7" />,
    title: "Etkinlik Oluştur",
    description: "Yeni etkinlikler ekleyebilir ve yönetebilirsin.",
    href: "/events/add",
  },
  {
    icon: <HiUserGroup className="text-purple-600 w-7 h-7" />,
    title: "Editörleri Görüntüle",
    description:
      "Tüm editörleri görüntüleyebilir ve yeni editör ekleyebilirsin.",
    href: "/editors",
  },
  {
    icon: <HiPlusCircle className="text-pink-600 w-7 h-7" />,
    title: "Dijital İçerik Ekle",
    description: "Kapdem Digital için yeni içerik ekleyebilirsin.",
    href: "/digital/add",
  },
];

export default function EditorPage() {
  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Editör Paneli</h1>
      <p className="text-gray-600 mb-8">
        Buradan bir editörün yapabileceği başlıca işlemleri görebilirsin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {editorTasks.map((task) => (
          <a
            key={task.title}
            href={task.href}
            className="flex items-center gap-4 p-5 bg-white rounded-xl shadow hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all group"
          >
            <div className="flex-shrink-0">{task.icon}</div>
            <div>
              <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                {task.title}
              </div>
              <div className="text-gray-500 text-sm">{task.description}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Son eklenen içerikler ve etkinlikler örnek olarak gösterilebilir */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Son Eklenen Yazılar
          </h2>
          <div className="text-gray-500">
            Burada son eklenen yazılar listelenebilir.
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Yaklaşan Etkinlikler
          </h2>
          <div className="text-gray-500">
            Burada yaklaşan etkinlikler listelenebilir.
          </div>
        </div>
      </div>
    </div>
  );
}
