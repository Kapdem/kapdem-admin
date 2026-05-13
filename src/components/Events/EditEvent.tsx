"use client";
import React, { useState, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { updateEvent } from "@/lib/posts/action";
import dynamic from "next/dynamic";

const NoSSRCKEditor = dynamic(
  () => import("@/components/Paper/NoSSRCKEditor"),
  {
    ssr: false,
    loading: () => <div className="p-4">Editor is loading...</div>,
  },
);

type Props = { res: any };

export default function EditEvent({ res }: Props) {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    res?.coverImage || null,
  );
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    res?.galleryImages || [],
  );
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    res?.galleryImages || [],
  );

  // Ekler (attachments) için state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    res?.attachments || [],
  );

  // Ekler dosyalarını ekle
  const handleAttachmentsAdd = (files: File[]) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  // Ek dosya kaldır
  const handleAttachmentRemove = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  // Mevcut ek dosya kaldır
  const handleExistingAttachmentRemove = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Çoklu dil desteği için content state'leri
  const getInitialContent = (language: "tr" | "en") => {
    // Backend'den gelen description field'ını oku
    if (res?.translations?.[language]?.description) {
      return res.translations[language].description;
    }
    // Fallback olarak eski content yapısını kontrol et
    if (res?.translations?.[language]?.content) {
      const content = res.translations[language].content;
      // Content bir object ise (html ve text içeriyorsa), html'i al
      if (typeof content === "object" && content?.html) {
        return content.html;
      }
      // Content string ise direkt döndür
      if (typeof content === "string") {
        return content;
      }
    }
    if (res?.content?.html) {
      return res.content.html;
    }
    if (typeof res?.content === "string") {
      return res.content;
    }
    return "";
  };

  const [contentTr, setContentTr] = useState(getInitialContent("tr"));
  const [contentEn, setContentEn] = useState(getInitialContent("en"));

  // Tarih formatını YYYY-MM-DDTHH:mm'ye çeviren fonksiyon
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}T${hours}:${minutes}`;
  };

  const removeImage = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview(null);
  };

  // Galeri resimlerini ekle
  const handleGalleryImagesAdd = (files: File[]) => {
    const newFiles = [...galleryImages, ...files];
    setGalleryImages(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  // Galeri resmini kaldır
  const handleGalleryImageRemove = (index: number) => {
    // Eğer mevcut bir resim ise (URL string), existingGalleryImages'tan kaldır
    if (index < existingGalleryImages.length) {
      const newExisting = existingGalleryImages.filter((_, i) => i !== index);
      const newPreviews = galleryPreviews.filter((_, i) => i !== index);
      setExistingGalleryImages(newExisting);
      setGalleryPreviews(newPreviews);
    } else {
      // Yeni eklenen bir resim ise (File), URL'i temizle
      const previewIndex = index;
      const previewUrl = galleryPreviews[previewIndex];
      // Eğer blob URL ise (yeni eklenen resim), temizle
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviews = galleryPreviews.filter((_, i) => i !== previewIndex);
      const fileIndex = previewIndex - existingGalleryImages.length;
      const newFiles = galleryImages.filter((_, i) => i !== fileIndex);
      setGalleryPreviews(newPreviews);
      setGalleryImages(newFiles);
    }
  };

  const initialValues = {
    titleTr: res?.translations?.tr?.title || res?.title || "",
    titleEn: res?.translations?.en?.title || "",
    excerptTr: res?.translations?.tr?.excerpt || "",
    excerptEn: res?.translations?.en?.excerpt || "",
    location: res.location || "",
    startDate: formatDate(res.startDate),
    endDate: formatDate(res.endDate) || "",
  };

  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Türkçe başlık zorunlu"),
    titleEn: Yup.string().required("İngilizce başlık zorunlu"),
    excerptTr: Yup.string().required("Türkçe kısa özet zorunlu"),
    excerptEn: Yup.string().required("İngilizce kısa özet zorunlu"),
    location: Yup.string().nullable(),
    startDate: Yup.date().required("Başlangıç tarihi zorunlu"),
    endDate: Yup.date().nullable(),
  });

  const generateSlug = (title: string, isEnglish: boolean = false) => {
    let slug = title
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

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const {
      _id,
      publishedAt,
      author,
      stats,
      id,
      editHistory,
      lastEditedBy,
      createdAt,
      updatedAt,
      ...rest
    } = res;
    let coverImageToSend = rest.coverImage;
    if (coverImage) {
      coverImageToSend = coverImage;
    }

    // Galeri resimlerini S3'e yükle
    let galleryImageUrls: string[] = [...existingGalleryImages];
    if (galleryImages.length > 0) {
      try {
        const { uploadToSignedURL } = await import("@/lib/admin/action");
        const uploadPromises = galleryImages.map(async (file) => {
          const fileType = file.type.startsWith("image/") ? "image" : "other";
          const uploadResult = await uploadToSignedURL(file, fileType);
          return uploadResult?.url || null;
        });
        const newUrls = (await Promise.all(uploadPromises)).filter(
          (url): url is string => url !== null,
        );
        galleryImageUrls = [...galleryImageUrls, ...newUrls];
      } catch (err) {
        console.error("Galeri resimleri yüklenirken hata:", err);
        toast.error("Galeri resimleri yüklenirken hata oluştu");
      }
    }

    const slugTr = generateSlug(values.titleTr, false);
    const slugEn = generateSlug(values.titleEn, true);

    // Convert dates to ISO string
    const startDateISO = values.startDate
      ? new Date(values.startDate).toISOString()
      : undefined;

    const endDateISO = values.endDate
      ? new Date(values.endDate).toISOString()
      : undefined;

    // Yeni eklenen attachments dosyalarını upload et
    let attachmentUrls: string[] = [...existingAttachments];
    if (attachments.length > 0) {
      try {
        const { uploadToSignedURL } = await import("@/lib/admin/action");
        const uploadPromises = attachments.map(async (file) => {
          const fileType = file.type.startsWith("image/") ? "image" : "other";
          const uploadResult = await uploadToSignedURL(file, fileType);
          return uploadResult?.url || null;
        });
        const newUrls = (await Promise.all(uploadPromises)).filter(
          (url): url is string => url !== null,
        );
        attachmentUrls = [...attachmentUrls, ...newUrls];
      } catch (err) {
        console.error("Ek dosyalar yüklenirken hata:", err);
        toast.error("Ek dosyalar yüklenirken hata oluştu");
      }
    }

    const data = {
      translations: {
        tr: {
          title: values.titleTr,
          slug: slugTr,
          description: contentTr,
          excerpt: values.excerptTr,
        },
        en: {
          title: values.titleEn,
          slug: slugEn,
          description: contentEn,
          excerpt: values.excerptEn,
        },
      },
      location: values.location || undefined,
      status: res.status,
      coverImage: coverImageToSend,
      galleryImages: galleryImageUrls,
      startDate: startDateISO,
      endDate: endDateISO || undefined,
      attachments: attachmentUrls,
    };
    await updateEvent(res._id, data);

    setSubmitting(false);
    toast.success("Etkinlik başarıyla güncellendi.");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg border-gray-300 shadow-lg border p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6">Etkinliği Düzenle</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, isSubmitting, values, handleChange }) => (
          <Form className="space-y-6">
            {/* Türkçe Başlık */}
            <div>
              <label
                htmlFor="titleTr"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Türkçe Etkinlik Başlığı
              </label>
              <Field
                type="text"
                id="titleTr"
                name="titleTr"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ErrorMessage
                name="titleTr"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* İngilizce Başlık */}
            <div>
              <label
                htmlFor="titleEn"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                İngilizce Etkinlik Başlığı
              </label>
              <Field
                type="text"
                id="titleEn"
                name="titleEn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ErrorMessage
                name="titleEn"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Türkçe Kısa Özet */}
            <div>
              <label
                htmlFor="excerptTr"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Türkçe Kısa Özet
              </label>
              <Field
                as="textarea"
                id="excerptTr"
                name="excerptTr"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                required
              />
              <ErrorMessage
                name="excerptTr"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* İngilizce Kısa Özet */}
            <div>
              <label
                htmlFor="excerptEn"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                İngilizce Kısa Özet
              </label>
              <Field
                as="textarea"
                id="excerptEn"
                name="excerptEn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                required
              />
              <ErrorMessage
                name="excerptEn"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Başlangıç Tarihi */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Başlangıç Tarihi *
              </label>
              <Field
                type="datetime-local"
                id="startDate"
                name="startDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ErrorMessage
                name="startDate"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Bitiş Tarihi */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bitiş Tarihi{" "}
                <span className="text-gray-500">(İsteğe bağlı)</span>
              </label>
              <Field
                type="datetime-local"
                id="endDate"
                name="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="endDate"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Konum */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Konum <span className="text-gray-500">(İsteğe bağlı)</span>
              </label>
              <Field
                type="text"
                id="location"
                name="location"
                placeholder="Örnek: KAPDEM Konferans Salonu, Ankara"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="location"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            {/* Galeri Resimleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Galeri Resimleri
              </label>
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative p-6 ${
                  galleryPreviews.length > 0
                    ? "border-blue-400"
                    : "border-gray-300"
                }`}
                onClick={() =>
                  document.getElementById("galleryImagesInput")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files).filter(
                      (file) => file.type.startsWith("image/"),
                    );
                    handleGalleryImagesAdd(files);
                  }
                }}
                style={{ minHeight: 180 }}
              >
                <input
                  id="galleryImagesInput"
                  name="galleryImages"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (
                      event.currentTarget.files &&
                      event.currentTarget.files.length > 0
                    ) {
                      const files = Array.from(event.currentTarget.files);
                      handleGalleryImagesAdd(files);
                    }
                  }}
                />
                {galleryPreviews.length > 0 ? (
                  <div className="w-full">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Galeri ${index + 1}`}
                            className="rounded shadow border bg-white w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGalleryImageRemove(index);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("galleryImagesInput")?.click();
                      }}
                      className="mt-2 px-4 py-2 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                    >
                      Daha Fazla Resim Ekle
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      Galeri resimleri eklemek için tıklayın veya sürükleyip
                      bırakın
                    </span>
                    <span className="text-xs mt-1">
                      (JPG, PNG veya GIF - Çoklu seçim)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ekler (Attachments) Alanı */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ekler (Dosya Yükle)
              </label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative p-6"
                onClick={() =>
                  document.getElementById("attachmentsInput")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files);
                    handleAttachmentsAdd(files);
                  }
                }}
                style={{ minHeight: 100 }}
              >
                <input
                  id="attachmentsInput"
                  name="attachments"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (
                      event.currentTarget.files &&
                      event.currentTarget.files.length > 0
                    ) {
                      const files = Array.from(event.currentTarget.files);
                      handleAttachmentsAdd(files);
                    }
                  }}
                />
                {/* Mevcut ekler */}
                {existingAttachments.length > 0 && (
                  <ul className="mb-2 w-full">
                    {existingAttachments.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-sm bg-white rounded p-2 mb-1 border"
                      >
                        <span>
                          {typeof file === "string"
                            ? file.split("/").pop()
                            : "Dosya"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExistingAttachmentRemove(idx);
                          }}
                          className="ml-2 px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                          Kaldır
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Yeni eklenen ekler */}
                {attachments.length > 0 ? (
                  <div className="w-full">
                    <ul className="mb-2">
                      {attachments.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-sm bg-white rounded p-2 mb-1 border"
                        >
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttachmentRemove(idx);
                            }}
                            className="ml-2 px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            Kaldır
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("attachmentsInput")?.click();
                      }}
                      className="mt-2 px-4 py-2 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                    >
                      Daha Fazla Dosya Ekle
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <span className="font-medium">
                      Ek dosyası eklemek için tıklayın veya sürükleyip bırakın
                    </span>
                    <span className="text-xs mt-1">
                      (Her türlü dosya - Çoklu seçim)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapak Görseli
              </label>
              <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Kapak önizleme"
                    className="max-h-40 rounded shadow border bg-white object-contain"
                    style={{ maxWidth: 200 }}
                  />
                )}
                <input
                  name="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (
                      event.currentTarget.files &&
                      event.currentTarget.files[0]
                    ) {
                      const file = event.currentTarget.files[0];
                      setFieldValue("coverImage", file);
                      setCoverImage(file);
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {coverPreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>
            {/* Türkçe İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Türkçe İçerik
              </label>
              <div className="bg-white border border-gray-300 rounded-md p-2">
                <NoSSRCKEditor data={contentTr} onChange={setContentTr} />
              </div>
            </div>

            {/* İngilizce İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İngilizce İçerik
              </label>
              <div className="bg-white border border-gray-300 rounded-md p-2">
                <NoSSRCKEditor data={contentEn} onChange={setContentEn} />
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
