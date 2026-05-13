"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { addPost } from "@/lib/admin/action";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Save } from "lucide-react";
import Image from "next/image";
import "../../../styles/ckeditor.css";
import ContentEditor from "@/components/Paper/ContentEditor";
import { getCategoriesList } from "@/lib/admin/data";
import { useEffect } from "react";

type Props = {
  initialData?: {
    title?: string;
    slug?: string;
    status?: string;
    accessTier?: string;
    author?: string;
  };
  onSubmit?: (data: unknown) => void;
  isLoading?: boolean;
};

export default function AddPaper(props: Props) {
  const { initialData, isLoading } = props;
  const [categories, setCategories] = useState<{ category: string; name: string }[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesList();
        if (Array.isArray(res)) setCategories(res);
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const author = initialData?.author;

  // Kategori API'si kaldırıldı, sabit kategori kullanılıyor

  // Formik ve Yup ile form
  const initialValues = {
    titleTr: initialData?.title || "",
    titleEn: "",
    excerptTr: "",
    excerptEn: "",
    status: initialData?.status || "publish",
    accessTier: initialData?.accessTier || "FREE",
    contentTr: "",
    contentEn: "",
    categories: [] as string[],
    coverImage: null as File | null,
    link: "",
  };

  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Türkçe başlık zorunlu"),
    titleEn: Yup.string().required("İngilizce başlık zorunlu"),
    excerptTr: Yup.string().required("Türkçe kısa özet zorunlu"),
    excerptEn: Yup.string().required("İngilizce kısa özet zorunlu"),
    status: Yup.string().required(),
    accessTier: Yup.string().required(),
    categories: Yup.array().min(1, "En az bir kategori seçin"),
    coverImage: Yup.mixed().required("Kapak görseli zorunlu"),
    link: Yup.string().url("Geçerli bir URL girin"),
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

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
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
      author,
      categories: values.categories,
      coverImage: values.coverImage,
      link: values.link,
    };
    try {
      const res = await addPost(paperData);
      if (res) {
        toast.success("Yazı başarıyla eklendi!");
        // router.push(`/digital/${res.slug}`);
      } else {
        toast.error("Kayıt sırasında hata oluştu");
      }
    } catch {
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dijital İçerik Ekle</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
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
                placeholder="Türkçe Başlık"
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
                İngilizce Başlık
              </label>
              <Field
                type="text"
                id="titleEn"
                name="titleEn"
                placeholder="İngilizce Başlık"
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
                htmlFor="link"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bağlantı Linki
              </label>
              <Field
                type="text"
                id="link"
                name="link"
                placeholder="Bağlantı Linki"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <ErrorMessage
                name="link"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriler
              </label>
              <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-4">
                {categories.map((cat) => (
                  <label key={cat.category} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categories"
                      value={cat.category}
                      checked={values.categories.includes(cat.category)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        if (checked) {
                          setFieldValue("categories", [...values.categories, value]);
                        } else {
                          setFieldValue(
                            "categories",
                            values.categories.filter((c) => c !== value)
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
            {/* Fotoğraf Yükleme Alanı (Modern ve Kullanıcı Dostu) */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapak Görseli
              </label>
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative p-6 ${coverPreview ? "border-blue-400" : "border-gray-300"
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
                    <Image
                      src={coverPreview}
                      alt="Kapak önizleme"
                      className="rounded shadow border bg-white max-h-48 max-w-xs object-contain"
                      width={200}
                      height={192}
                    />
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
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting || isLoading
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
