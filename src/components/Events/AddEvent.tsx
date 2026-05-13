"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { addEvent } from "@/lib/admin/action";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Save } from "lucide-react";

import { useRouter } from "next/navigation";
import "../../styles/ckeditor.css";
import ContentEditor from "../Paper/ContentEditor";

type Props = {
  initialData?: {
    title?: string;
    slug?: string;
    status?: string;
    startDate?: string;
  };
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
};

export default function AddEvent({ initialData, isLoading }: Props) {
  const router = useRouter();

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  // Ekler dosyalarını ekle
  const handleAttachmentsAdd = (files: File[]) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  // Ek dosya kaldır
  const handleAttachmentRemove = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  // const [content, setContent] = useState<string>("");

  const initialValues = {
    titleTr: initialData?.title || "",
    titleEn: "",
    excerptTr: "",
    excerptEn: "",
    status: initialData?.status || "publish",
    coverImage: null,
    galleryImages: [],
    location: "",
    contentTr: "",
    contentEn: "",
    startDate: initialData?.startDate || "",
    endDate: "",
  };

  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Türkçe başlık zorunlu"),
    titleEn: Yup.string().required("İngilizce başlık zorunlu"),
    excerptTr: Yup.string().required("Türkçe kısa özet zorunlu"),
    excerptEn: Yup.string().required("İngilizce kısa özet zorunlu"),
    status: Yup.string().required(),
    coverImage: Yup.mixed().required("Kapak görseli zorunlu"),
    location: Yup.string().nullable(),
    contentTr: Yup.string().required("Türkçe içerik zorunlu"),
    contentEn: Yup.string().required("İngilizce içerik zorunlu"),
    startDate: Yup.date().required("Başlangıç tarihi zorunlu"),
    endDate: Yup.date().nullable(),
  });

  // Galeri resimlerini ekle
  const handleGalleryImagesAdd = (files: File[]) => {
    const newFiles = [...galleryImages, ...files];
    setGalleryImages(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  // Galeri resmini kaldır
  const handleGalleryImageRemove = (index: number) => {
    // URL'i temizle
    URL.revokeObjectURL(galleryPreviews[index]);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    const newFiles = galleryImages.filter((_, i) => i !== index);
    setGalleryPreviews(newPreviews);
    setGalleryImages(newFiles);
  };

  // Slug otomatik üretici
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

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const slugTr = generateSlug(values.titleTr, false);
    const slugEn = generateSlug(values.titleEn, true);

    try {
      let galleryImageUrls: string[] = [];
      if (galleryImages.length > 0) {
        const { uploadToSignedURL } = await import("@/lib/admin/action");
        const uploadPromises = galleryImages.map(async (file) => {
          const fileType = file.type.startsWith("image/") ? "image" : "other";
          const uploadResult = await uploadToSignedURL(file, fileType);
          return uploadResult?.url || null;
        });
        galleryImageUrls = (await Promise.all(uploadPromises)).filter(
          (url): url is string => url !== null,
        );
      }

      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        const { uploadToSignedURL } = await import("@/lib/admin/action");
        const uploadPromises = attachments.map(async (file) => {
          const fileType = file.type.startsWith("image/") ? "image" : "other";
          const uploadResult = await uploadToSignedURL(file, fileType);
          return uploadResult?.url || null;
        });
        attachmentUrls = (await Promise.all(uploadPromises)).filter(
          (url): url is string => url !== null,
        );
      }

      const eventData = {
        translations: {
          tr: {
            title: values.titleTr,
            slug: slugTr,
            description: values.contentTr,
            excerpt: values.excerptTr,
          },
          en: {
            title: values.titleEn,
            slug: slugEn,
            description: values.contentEn,
            excerpt: values.excerptEn,
          },
        },
        status: values.status,
        coverImage: values.coverImage,
        galleryImages: galleryImageUrls,
        attachments: attachmentUrls,
        location: values.location?.trim() || undefined,
        startDate: values.startDate
          ? new Date(values.startDate).toISOString()
          : undefined,
        endDate: values.endDate
          ? new Date(values.endDate).toISOString()
          : undefined,
      };

      const res = await addEvent(eventData);
      if (res) {
        toast.success("Etkinlik başarıyla eklendi!");
        router.push(`/events`);
      } else {
        const error = res?.message || "Kayıt sırasında hata oluştu";
        toast.error(error);
      }
    } catch (err: any) {
      console.error("Error adding event:", err);
      const errorMessage = err?.message || "Kayıt sırasında hata oluştu";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  {
    /* Ekler (Attachments) Alanı */
  }
  <div className="pt-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Ekler (Dosya Yükle)
    </label>
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative p-6"
      onClick={() => document.getElementById("attachmentsInput")?.click()}
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
          <span className="text-xs mt-1">(Her türlü dosya - Çoklu seçim)</span>
        </div>
      )}
    </div>
  </div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Etkinlik Ekle</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, values, handleChange }) => (
          <Form className="space-y-6">
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

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Durum
              </label>
              <Field
                as="select"
                id="status"
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="publish">Yayınla</option>
                <option value="draft">Taslak</option>
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            {/* Türkçe İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Türkçe İçerik
              </label>
              <div className="bg-white border border-gray-300 rounded-md p-2">
                <ContentEditor
                  value={values.contentTr}
                  onChange={(data) => setFieldValue("contentTr", data)}
                />
              </div>
              <ErrorMessage
                name="contentTr"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            {/* İngilizce İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İngilizce İçerik
              </label>
              <div className="bg-white border border-gray-300 rounded-md p-2">
                <ContentEditor
                  value={values.contentEn}
                  onChange={(data) => setFieldValue("contentEn", data)}
                />
              </div>
              <ErrorMessage
                name="contentEn"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            {/* Galeri Resimleri */}
            <div className="pt-2">
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

            {/* Fotoğraf Yükleme Alanı (Modern ve Kullanıcı Dostu) */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapak Görseli
              </label>
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative p-6 ${
                  coverPreview ? "border-blue-400" : "border-gray-300"
                }`}
                onClick={() =>
                  document.getElementById("coverImageInput")?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setFieldValue("coverImage", file);
                    setCoverPreview(URL.createObjectURL(file));
                  }
                }}
                style={{ minHeight: 180 }}
              >
                <input
                  id="coverImageInput"
                  name="coverImage"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (
                      event.currentTarget.files &&
                      event.currentTarget.files[0]
                    ) {
                      const file = event.currentTarget.files[0];
                      setFieldValue("coverImage", file);
                      setCoverPreview(URL.createObjectURL(file));
                    } else {
                      setCoverPreview(null);
                    }
                  }}
                />
                {coverPreview ? (
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={coverPreview}
                      alt="Kapak önizleme"
                      className="rounded shadow border bg-white max-h-48 max-w-xs object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFieldValue("coverImage", null);
                        setCoverPreview(null);
                        (
                          document.getElementById(
                            "coverImageInput",
                          ) as HTMLInputElement
                        ).value = "";
                      }}
                      className="mt-3 px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      Kaldır
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
                        d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-1m6 2a2 2 0 002-2v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1a2 2 0 002 2h6z"
                      />
                    </svg>
                    <span className="font-medium">
                      Görsel seçmek için tıklayın veya sürükleyip bırakın
                    </span>
                    <span className="text-xs mt-1">(JPG, PNG veya GIF)</span>
                  </div>
                )}
              </div>
              <ErrorMessage
                name="coverImage"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting || isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting || isLoading ? (
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
                    Yazıyı Kaydet
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
