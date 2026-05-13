"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { addPost } from "@/lib/admin/action";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Save } from "lucide-react";
import "../../styles/ckeditor.css";
import { useRouter } from "next/navigation";
import { getCategoriesList, availableAuthors } from "@/lib/admin/data";
import ContentEditor from "@/components/Paper/ContentEditor";

type Props = {
  initialData?: {
    title?: string;
    slug?: string;
    content?: { html: string; text: string };
    excerpt?: string;
    status?: string;
    accessTier?: string;
    author?: string;
  };

  authors?: any[];

  isLoading?: boolean;
};

export default function AddPaper({ initialData, isLoading }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<
    { category: string; name: string }[]
  >([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesList();
        if (Array.isArray(res)) setCategories(res);
      } catch (error) {
        setCategories([]);
      }
    };
    const fetchAuthors = async () => {
      try {
        const res = await availableAuthors();

        if (Array.isArray(res)) {
          setAuthors(res);
        } else if (res && Array.isArray(res.authors)) {
          setAuthors(res.authors);
        } else {
          setAuthors([]);
        }
      } catch (error) {
        setAuthors([]);
      }
    };
    fetchCategories();
    fetchAuthors();
  }, []);

  // Formik ve Yup ile form
  const initialValues = {
    titleTr: initialData?.title || "",
    titleEn: "",
    excerptTr: initialData?.excerpt || "",
    excerptEn: "",
    status: initialData?.status || "publish",
    accessTier: initialData?.accessTier || "FREE",
    categories: [] as string[],
    coverImage: null,
    audioFile: null as File | null,
    contentTr: initialData?.content?.html || "",
    contentEn: "",
    publishedAt: "",
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Türkçe başlık zorunlu"),
    titleEn: Yup.string().required("İngilizce başlık zorunlu"),
    excerptTr: Yup.string().required("Türkçe kısa özet zorunlu"),
    excerptEn: Yup.string().required("İngilizce kısa özet zorunlu"),
    status: Yup.string().required(),
    accessTier: Yup.string().required(),
    categories: Yup.array().min(1, "En az bir kategori seçin"),
    coverImage: Yup.mixed().required("Kapak görseli zorunlu"),
    contentTr: Yup.string().required("Türkçe içerik zorunlu"),
    contentEn: Yup.string().required("İngilizce içerik zorunlu"),
  });

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

    const paperData = {
      translations: {
        tr: {
          title: values.titleTr,
          slug: slugTr,
          content: values.contentTr,
          excerpt: values.excerptTr,
        },
        en: {
          title: values.titleEn,
          slug: slugEn,
          content: values.contentEn,
          excerpt: values.excerptEn,
        },
      },
      status: values.status,
      accessTier: values.accessTier,
      authorId,
      categories: values.categories,
      coverImage: values.coverImage, // dosya objesi
      audioFile: values.audioFile, // dosya objesi
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : undefined,
    };
    try {
      const res = await addPost(paperData);

      if (res) {
        toast.success("Yazı başarıyla eklendi!");
        router.push(`/paper/${res.id || res._id}`);
      } else {
        toast.error("Kayıt sırasında hata oluştu");
      }
    } catch (err) {
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesList();
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Yeni Yazı Ekle</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
            {/* Kapak Görseli Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapak Görseli
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);

                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setFieldValue("coverImage", file);

                    // Görsel önizleme için URL oluştur
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setImagePreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                {!imagePreview ? (
                  <>
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-medium">
                        Dosya yüklemek için tıklayın
                      </span>{" "}
                      veya sürükleyip bırakın
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF (Max. 5MB)
                    </p>
                  </>
                ) : (
                  <div className="relative w-full h-96 overflow-hidden rounded-md">
                    <img
                      src={imagePreview}
                      alt="Kapak görseli önizleme"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                      onClick={() => {
                        setImagePreview(null);
                        setFieldValue("coverImage", null);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
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

                      // Görsel önizleme için URL oluştur
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setImagePreview(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <ErrorMessage
                name="coverImage"
                component="div"
                className="text-red-500 text-xs mt-1"
              />

              {/* Kapak görseli önizleme */}
            </div>
            {/* Ses Dosyası Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ses Dosyası (isteğe bağlı)
              </label>
              <input
                name="audioFile"
                type="file"
                accept="audio/*"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (
                    event.currentTarget.files &&
                    event.currentTarget.files[0]
                  ) {
                    setFieldValue("audioFile", event.currentTarget.files[0]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {values.audioFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {(values.audioFile as File).name}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => setFieldValue("audioFile", null)}
                  >
                    Kaldır
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
                İngilizce Başlık
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
            {/* Author Dropdown */}
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
                <option value="" disabled>
                  Yazar seç
                </option>
                {authors && authors.length > 0 ? (
                  authors.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName || `${a.firstName} ${a.lastName}`}
                    </option>
                  ))
                ) : (
                  <option value="">Yazar bulunamadı</option>
                )}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Seçili yazar:{" "}
                {(() => {
                  const selected = authors?.find((a: any) => a.id === authorId);
                  if (!selected) return "-";
                  if (selected.fullName) return selected.fullName;
                  if (selected.firstName || selected.lastName)
                    return `${selected.firstName || ""} ${
                      selected.lastName || ""
                    }`.trim();
                  return "-";
                })()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriler
              </label>
              <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-4">
                {categories.map((cat) => (
                  <label
                    key={cat.category}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="categories"
                      value={cat.category}
                      checked={values.categories.includes(cat.category)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        if (checked) {
                          setFieldValue("categories", [
                            ...values.categories,
                            value,
                          ]);
                        } else {
                          setFieldValue(
                            "categories",
                            values.categories.filter((c) => c !== value),
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
              <ErrorMessage
                name="categories"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            {/* Türkçe İçerik (CKEditor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Türkçe İçerik
              </label>
              <div className="border border-gray-300 rounded-md">
                <ContentEditor
                  value={values.contentTr}
                  onChange={(data: any) => setFieldValue("contentTr", data)}
                />
                <ErrorMessage
                  name="contentTr"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
            </div>
            {/* İngilizce İçerik (CKEditor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İngilizce İçerik
              </label>
              <div className="border border-gray-300 rounded-md">
                <ContentEditor
                  value={values.contentEn}
                  onChange={(data: any) => setFieldValue("contentEn", data)}
                />
                <ErrorMessage
                  name="contentEn"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
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
            {/* Published At */}
            <div>
              <label
                htmlFor="publishedAt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Yayınlanma Tarihi (isteğe bağlı)
              </label>
              <Field
                type="date"
                id="publishedAt"
                name="publishedAt"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Boş bırakılırsa mevcut tarih kullanılır. Eski tarihli yazı
                eklemek için kullanabilirsiniz.
              </p>
              <ErrorMessage
                name="publishedAt"
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
