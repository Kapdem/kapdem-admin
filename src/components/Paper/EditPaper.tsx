"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { ImageUp, Save, X, Music, Upload } from "lucide-react";
import { toast } from "react-toastify";
import "../../styles/ckeditor.css";
import { updatePost } from "@/lib/posts/action";
import Image from "next/image";
import ContentEditor from "@/components/Paper/ContentEditor";
import { getCategoriesList } from "@/lib/admin/data";

type Props = {
  data: any;
  authors: any;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
};

export default function EditPaper({
  data,
  authors,
  onSubmit,
  isLoading: externalLoading,
}: Props) {
  const [isLoading, setIsLoading] = useState(externalLoading || false);

  type Tier = "FREE" | "PAID" | "PREMIUM" | "ADMIN" | "EDITOR" | "SUPER_ADMIN";

  const accessTiers: { id: Tier; name: string }[] = [
    { id: "FREE", name: "Ücretsiz İçerik" },
    { id: "PAID", name: "Ücretli İçerik" },
    { id: "PREMIUM", name: "Premium İçerik" },
    { id: "ADMIN", name: "Admin Erişimi" },
    { id: "EDITOR", name: "Editör Erişimi" },
    { id: "SUPER_ADMIN", name: "Süper Admin Erişimi" },
  ];

  const getInitialContent = (language: "tr" | "en") => {
    // Önce translations'dan kontrol et
    if (data?.translations?.[language]?.content) {
      const content = data.translations[language].content;
      // Content bir object ise (html ve text içeriyorsa), html'i al
      if (typeof content === "object" && content?.html) {
        return content.html;
      }
      // Content string ise direkt döndür
      if (typeof content === "string") {
        return content;
      }
    }
    // Fallback: Eski content yapısı
    if (data?.content) {
      if (typeof data.content === "object" && data.content?.html) {
        return data.content.html;
      }
      if (typeof data.content === "string") {
        return data.content;
      }
    }
    return "";
  };

  const getAuthorId = () => {
    if (data?.author) {
      // author bir string ise direkt kullan (ObjectId string)
      if (typeof data.author === "string") {
        return data.author;
      }
      // author bir object ise id veya _id'yi kontrol et
      if (data.author.id) return data.author.id;
      if (data.author._id) return data.author._id;
    }
    return authors && authors.length > 0 ? authors[0].id : "";
  };

  // Çoklu dil desteği için state'ler
  const [titleTr, setTitleTr] = useState(
    data?.translations?.tr?.title || data?.title || "",
  );
  const [titleEn, setTitleEn] = useState(data?.translations?.en?.title || "");
  const [excerptTr, setExcerptTr] = useState(
    data?.translations?.tr?.excerpt || data?.excerpt || "",
  );
  const [excerptEn, setExcerptEn] = useState(
    data?.translations?.en?.excerpt || "",
  );
  const [slugTr, setSlugTr] = useState(
    data?.translations?.tr?.slug || data?.slug || "",
  );
  const [slugEn, setSlugEn] = useState(data?.translations?.en?.slug || "");
  const [contentTr, setContentTr] = useState(getInitialContent("tr"));
  const [contentEn, setContentEn] = useState(getInitialContent("en"));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    data?.categories || [],
  );
  const [categoriesList, setCategoriesList] = useState<
    { category: string; name: string }[]
  >([]);

  const [authorId, setAuthorId] = useState(getAuthorId());

  const [selectedAccessTier, setSelectedAccessTier] = useState<Tier>(
    (data?.accessTier as Tier) || "PAID",
  );
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    data?.coverImage || data?.featuredImage || null,
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    typeof data?.audioFile === "string" ? data.audioFile : null,
  );
  const [removeAudio, setRemoveAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const getFormattedDate = () => {
    try {
      if (data?.publishedAt) {
        const date = new Date(data.publishedAt);

        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      }

      return "";
    } catch (error) {
      console.error("Error parsing publishedAt date:", error);
      return "";
    }
  };

  const [publishedAt, setPublishedAt] = useState<string>(getFormattedDate());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesList();
        if (Array.isArray(res)) setCategoriesList(res);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleAccessTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccessTier(e.target.value as Tier);
  };

  const generateSlug = (text: string, isEnglish: boolean = false) => {
    let slug = text
      .toLocaleLowerCase(isEnglish ? "en-US" : "tr-TR")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // İngilizce için özel karakterleri temizle
    if (isEnglish) {
      slug = slug
        .replace(/[àáâãäå]/g, "a")
        .replace(/[èéêë]/g, "e")
        .replace(/[ìíîï]/g, "i")
        .replace(/[òóôõö]/g, "o")
        .replace(/[ùúûü]/g, "u")
        .replace(/[ñ]/g, "n");
    }

    return slug;
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (!data?.translations?.tr?.slug && !data?.slug) {
      setSlugTr(generateSlug(titleTr, false));
    }
  }, [titleTr, data?.translations?.tr?.slug, data?.slug]);

  useEffect(() => {
    if (!data?.translations?.en?.slug) {
      setSlugEn(generateSlug(titleEn, true));
    }
  }, [titleEn, data?.translations?.en?.slug]);

  // Set image preview from existing data
  useEffect(() => {
    if ((data?.coverImage || data?.featuredImage) && !imagePreview) {
      setImagePreview(data.coverImage || data.featuredImage);
    }
  }, [data, imagePreview]);

  // Handle image upload with react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFeaturedImage(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  // Remove the selected image
  const removeImage = () => {
    // URL.revokeObjectURL sadece kendi oluşturduğumuz local URL'ler için geçerli
    // Bu yüzden sadece yeni eklenen resimler için çalıştırıyoruz
    if (imagePreview && featuredImage) {
      URL.revokeObjectURL(imagePreview);
    }
    setFeaturedImage(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create paper data object with translations
    const paperData = {
      translations: {
        tr: {
          title: titleTr,
          slug: slugTr,
          content: contentTr,
          excerpt: excerptTr,
        },
        en: {
          title: titleEn,
          slug: slugEn,
          content: contentEn,
          excerpt: excerptEn,
        },
      },
      accessTier: selectedAccessTier,
      authorId,
      categories: selectedCategories,
      ...(featuredImage && { featuredImage }),
      ...(!featuredImage && imagePreview && { coverImage: imagePreview }),
      ...(publishedAt && { publishedAt: new Date(publishedAt).toISOString() }),
      ...(audioFile ? { audioFile } : removeAudio ? { audioFile: null } : {}),
    };

    // Show loading toast
    const toastId = toast.loading("Yazı güncelleniyor...");

    try {
      if (data?._id) {
        const response = await updatePost(data._id, paperData);

        toast.update(toastId, {
          render: "Yazı başarıyla güncellendi!",
          type: "success",
          isLoading: false,
          autoClose: 1500,
          closeButton: true,
        });

        if (response && onSubmit) {
          onSubmit(response);
        }
      }
    } catch (error: any) {
      console.error("Error updating paper:", error);

      toast.update(toastId, {
        render:
          error?.message ||
          "Yazı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Yazıyı Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Featured Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kapak Görseli
          </label>

          {!imagePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
              } rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
            >
              <input {...getInputProps()} />
              <ImageUp className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Görsel yüklemek için tıklayın veya sürükleyin
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WEBP formatları desteklenir
              </p>
            </div>
          ) : (
            <div className="relative mt-2 inline-block">
              <Image
                width={1920}
                height={1080}
                src={imagePreview}
                alt="Preview"
                className="h-96 object-cover max-w-full rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Türkçe Başlık */}
        <div>
          <label
            htmlFor="titleTr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Türkçe Başlık
          </label>
          <input
            type="text"
            id="titleTr"
            value={titleTr}
            onChange={(e) => setTitleTr(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* İngilizce Başlık */}
        <div>
          <label
            htmlFor="titleEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            İngilizce Başlık
          </label>
          <input
            type="text"
            id="titleEn"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Türkçe Özet */}
        <div>
          <label
            htmlFor="excerptTr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Türkçe Özet
          </label>
          <textarea
            id="excerptTr"
            value={excerptTr}
            onChange={(e) => setExcerptTr(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            placeholder="Yazının Türkçe kısa özetini buraya yazın..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu özet, yazının önizlemesinde ve arama sonuçlarında
            gösterilecektir.
          </p>
        </div>

        {/* İngilizce Özet */}
        <div>
          <label
            htmlFor="excerptEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            İngilizce Özet
          </label>
          <textarea
            id="excerptEn"
            value={excerptEn}
            onChange={(e) => setExcerptEn(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            placeholder="Yazının İngilizce kısa özetini buraya yazın..."
            required
          />
        </div>

        {/* Türkçe Slug */}
        <div>
          <label
            htmlFor="slugTr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Türkçe SEO URL (Slug)
          </label>
          <input
            type="text"
            id="slugTr"
            value={slugTr}
            onChange={(e) => setSlugTr(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            URL'de kullanılacak olan kısaltılmış isim (Boşluk yerine tire
            kullanın)
          </p>
        </div>

        {/* İngilizce Slug */}
        <div>
          <label
            htmlFor="slugEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            İngilizce SEO URL (Slug)
          </label>
          <input
            type="text"
            id="slugEn"
            value={slugEn}
            onChange={(e) => setSlugEn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Yazar
          </label>
          <select
            id="author"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {authors && authors.length > 0 ? (
              authors.map((a: any) => {
                const aId = a.id || a._id;
                return (
                  <option key={aId} value={aId}>
                    {a.fullName || `${a.firstName} ${a.lastName}`}
                  </option>
                );
              })
            ) : (
              <option value="">Yazar bulunamadı</option>
            )}
          </select>
          {/* Show selected author info for clarity (optional) */}
          <div className="text-xs text-gray-500 mt-1">
            Seçili yazar:{" "}
            {authors?.find((a: any) => (a.id || a._id) === authorId)
              ?.fullName || "-"}
          </div>
        </div>

        {/* Kategoriler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategoriler
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border border-gray-300 rounded-md p-4 bg-gray-50">
            {categoriesList.map((cat) => (
              <label
                key={cat.category}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([
                        ...selectedCategories,
                        cat.category,
                      ]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== cat.category),
                      );
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Access Tier */}
          <div>
            <label
              htmlFor="accessTier"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Erişim İzni
            </label>
            <select
              id="accessTier"
              value={selectedAccessTier}
              onChange={handleAccessTierChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {accessTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Published At */}
          <div>
            <label
              htmlFor="publishedAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Yayınlanma Tarihi (isteğe bağlı)
            </label>
            <input
              type="date"
              id="publishedAt"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakılırsa mevcut tarih kullanılır.
            </p>
          </div>
        </div>

        {/* Türkçe İçerik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Türkçe İçerik
          </label>
          <div className="border border-gray-300 rounded-md">
            <ContentEditor
              value={contentTr}
              onChange={(newContent: any) => setContentTr(newContent)}
            />
          </div>
        </div>

        {/* İngilizce İçerik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İngilizce İçerik
          </label>
          <div className="border border-gray-300 rounded-md">
            <ContentEditor
              value={contentEn}
              onChange={(newContent: any) => setContentEn(newContent)}
            />
          </div>
        </div>

        {/* Ses Dosyası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ses Dosyası
          </label>

          {audioUrl && !audioFile && (
            <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Music size={20} className="text-blue-500 shrink-0" />
              <audio controls className="flex-1 h-9" src={audioUrl} />
              <button
                type="button"
                onClick={() => {
                  setAudioUrl(null);
                  setRemoveAudio(true);
                }}
                className="text-red-500 hover:text-red-700"
                title="Ses dosyasını kaldır"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {audioFile ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Music size={20} className="text-blue-500 shrink-0" />
              <span className="flex-1 text-sm text-gray-700 truncate">
                {audioFile.name}
              </span>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="text-red-500 hover:text-red-700"
                title="Seçimi iptal et"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {audioUrl
                  ? "Yeni ses dosyası yüklemek için tıklayın"
                  : "Ses dosyası yüklemek için tıklayın"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                MP3, WAV, OGG formatları desteklenir
              </p>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAudioFile(file);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
