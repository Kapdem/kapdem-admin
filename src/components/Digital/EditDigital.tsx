"use client";
import { updatePost } from "@/lib/posts/action";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getCategoriesList } from "@/lib/admin/data";
import { useEffect } from "react";

type Props = { post: any };

export default function EditDigital({ post }: Props) {
  const router = useRouter();

  const [coverPreview, setCoverPreview] = useState<string | null>(
    post?.coverImage
  );
  const [categoriesList, setCategoriesList] = useState<
    { category: string; name: string }[]
  >([]);

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

  const initialValues = {
    titleTr: post?.translations?.tr?.title || post?.title || "",
    titleEn: post?.translations?.en?.title || "",
    excerptTr: post?.translations?.tr?.excerpt || "",
    excerptEn: post?.translations?.en?.excerpt || "",
    link: post.link || "",
    accessTier: post.accessTier || "FREE",
    coverImage: post.coverImage || null,
    categories: post.categories || [],
  };

  const validationSchema = Yup.object({
    titleTr: Yup.string().required("Türkçe başlık zorunlu"),
    titleEn: Yup.string().required("İngilizce başlık zorunlu"),
    excerptTr: Yup.string().required("Türkçe kısa özet zorunlu"),
    excerptEn: Yup.string().required("İngilizce kısa özet zorunlu"),
    link: Yup.string().url("Geçerli bir URL girin"),
    accessTier: Yup.string().required(),
    coverImage: Yup.mixed(),
    categories: Yup.array().min(1, "En az bir kategori seçin"),
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
    const { _id, publishedAt, author, stats, preview, ...rest } = post;
    let coverImageToSend = rest.coverImage;

    if (values.coverImage && typeof values.coverImage !== "string") {
      coverImageToSend = "";
    } else if (typeof values.coverImage === "string") {
      coverImageToSend = values.coverImage;
    } else {
      coverImageToSend = post.coverImage || "";
    }

    const slugTr = generateSlug(values.titleTr, false);
    const slugEn = generateSlug(values.titleEn, true);

    const data = {
      ...rest,
      translations: {
        tr: {
          title: values.titleTr,
          slug: slugTr,
          excerpt: values.excerptTr,
        },
        en: {
          title: values.titleEn,
          slug: slugEn,
          excerpt: values.excerptEn,
        },
      },
      link: values.link,
      accessTier: values.accessTier,
      coverImage: coverImageToSend,
      categories: values.categories,
    };

    const res = await updatePost(post._id, data);

    setSubmitting(false);
    toast.success("Dijital içerik başarıyla güncellendi.");
    router.push("/digital");
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg border-gray-300 shadow-lg border p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6">Dijital İçeriği Düzenle</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form className="space-y-6">
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

            {/* Link */}
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
                placeholder="Spotify Bağlantısı"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="link"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Erişim Seviyesi */}
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

            {/* Kategoriler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategoriler
              </label>
              <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-4 bg-gray-50">
                {categoriesList.map((cat) => (
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
                          setFieldValue("categories", [...values.categories, value]);
                        } else {
                          setFieldValue(
                            "categories",
                            values.categories.filter((c: string) => c !== value)
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

            {/* Kapak Görseli */}
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
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
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
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting
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
