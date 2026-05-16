"use client";

import React, { useState } from "react";
import { updateSpecialFile } from "@/lib/special-files/action";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Save } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import ContentEditor from "@/components/Paper/ContentEditor";
import "../../styles/ckeditor.css";

interface Author {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

interface SpecialFileData {
  _id: string;
  translations?: {
    tr?: {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
    };
    en?: {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
    };
  };
  // Legacy fields (backward compatibility)
  title?: string;
  slug?: string;
  content?: string | { html?: string; text?: string };
  excerpt?: string;
  status: string;
  accessTier: string;
  coverImage?: string;
  author?: {
    _id: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Props {
  data: SpecialFileData;
  authors: Author[];
}

export default function EditSpecialFile({ data, authors }: Props) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(
    data.coverImage || null
  );

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

  // Formik initial values - mevcut verilerden doldur
  // Hem yeni format (translations) hem legacy format desteklenir
  const initialValues = {
    titleTr: data.translations?.tr?.title || data.title || "",
    excerptTr: data.translations?.tr?.excerpt || data.excerpt || "",
    status: data.status || "publish",
    accessTier: data.accessTier || "FREE",
    contentTr:
      (typeof data.translations?.tr?.content === "string"
        ? data.translations?.tr?.content
        : (data.translations?.tr?.content as any)?.html) ||
      (typeof data.content === "string" ? data.content : data.content?.html) ||
      "",
    coverImage: null as File | null,
    authorId: data.author?._id || "",
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Başlık zorunlu"),
    excerptTr: Yup.string().required("Kısa özet zorunlu"),
    status: Yup.string().required(),
    accessTier: Yup.string().required(),
    contentTr: Yup.string().required("İçerik zorunlu"),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    const slugTr = generateSlug(values.titleTr, false);

    const specialFileData: any = {
      translations: {
        tr: {
          title: values.titleTr,
          slug: slugTr,
          content: values.contentTr,
          excerpt: values.excerptTr,
        },
      },
      status: values.status,
      accessTier: values.accessTier,
    };

    // Yeni kapak görseli yüklendiyse ekle
    if (values.coverImage) {
      specialFileData.coverImage = values.coverImage;
    } else if (coverPreview === null && !values.coverImage) {
      // Görsel silinmişse boş string gönder
      specialFileData.coverImage = "";
    }

    // Opsiyonel alanlar
    if (values.authorId) specialFileData.authorId = values.authorId;

    // Güncelleme değişikliği ekle
    specialFileData.changes = "Dosya güncellendi";

    try {
      const result = await updateSpecialFile(data._id, specialFileData);
      if (result) {
        toast.success("Özel dosya başarıyla güncellendi!");
        router.push("/special-files");
      } else {
        toast.error("Güncelleme sırasında hata oluştu");
      }
    } catch (err) {
      console.error("❌ Hata:", err);
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Özel Dosyayı Düzenle</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
            {/* Başlık */}
            <div>
              <label
                htmlFor="titleTr"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Başlık
              </label>
              <Field
                type="text"
                id="titleTr"
                name="titleTr"
                placeholder="Başlık"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ErrorMessage
                name="titleTr"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Kısa Özet */}
            <div>
              <label
                htmlFor="excerptTr"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kısa Özet
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

            {/* Status */}
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
                <option value="private">Özel</option>
                <option value="trash">Çöp Kutusu</option>
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Access Tier */}
            <div>
              <label
                htmlFor="accessTier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Erişim Seviyesi
              </label>
              <Field
                as="select"
                id="accessTier"
                name="accessTier"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="FREE">Ücretsiz İçerik</option>
                <option value="PAID">Ücretli İçerik</option>
                <option value="PREMIUM">Premium İçerik</option>
                <option value="ADMIN">Admin Erişimi</option>
                <option value="EDITOR">Editör Erişimi</option>
                <option value="SUPER_ADMIN">Süper Admin Erişimi</option>
              </Field>
              <ErrorMessage
                name="accessTier"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Yazar Seçimi */}
            <div>
              <label
                htmlFor="authorId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Yazar
              </label>
              <Field
                as="select"
                id="authorId"
                name="authorId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Yazar seçin (opsiyonel)</option>
                {authors && authors.length > 0 ? (
                  authors.map((author: Author) => (
                    <option key={author.id} value={author.id}>
                      {author.fullName ||
                        `${author.firstName} ${author.lastName}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Yazar bulunamadı
                  </option>
                )}
              </Field>
              {values.authorId && (
                <div className="text-xs text-gray-500 mt-1">
                  Seçili yazar:{" "}
                  {authors?.find((a: Author) => a.id === values.authorId)
                    ?.fullName || "-"}
                </div>
              )}
            </div>

            {/* İçerik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İçerik
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

            {/* Kapak Görseli - Modern Drag & Drop */}
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
                    }
                  }}
                />
                {coverPreview ? (
                  <div className="flex flex-col items-center w-full">
                    <Image
                      src={coverPreview}
                      alt="Kapak önizleme"
                      className="rounded shadow border bg-white max-h-48 max-w-xs object-contain"
                      width={200}
                      height={192}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFieldValue("coverImage", null);
                          setCoverPreview(null);
                          (
                            document.getElementById(
                              "coverImageInput"
                            ) as HTMLInputElement
                          ).value = "";
                        }}
                        className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        Görseli Sil
                      </button>
                      {data.coverImage && coverPreview === data.coverImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFieldValue("coverImage", null);
                            setCoverPreview(null);
                            (
                              document.getElementById(
                                "coverImageInput"
                              ) as HTMLInputElement
                            ).value = "";
                          }}
                          className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                          Değiştir
                        </button>
                      )}
                    </div>
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
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? (
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
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Değişiklikleri Kaydet
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
