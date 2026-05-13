"use server";

import { fetchInstance } from "@/utils/fetch";

/**
 * Özel dosya oluşturma fonksiyonu
 * @param {Object} data - Form data
 */
export const createSpecialFile = async (data) => {
  // FormData oluştur
  const formData = new FormData();

  // coverImage File ise ekle
  if (data.coverImage && data.coverImage instanceof File) {
    formData.append("coverImage", data.coverImage);
  }

  // translations object'i JSON string'e çevir
  if (data.translations) {
    formData.append("translations", JSON.stringify(data.translations));
  }

  // attachments array'i virgülle ayrılmış string'e çevir
  if (data.attachments && Array.isArray(data.attachments)) {
    formData.append("attachments", data.attachments.join(","));
  }

  // Diğer alanları ekle
  Object.keys(data).forEach((key) => {
    if (
      key !== "translations" &&
      key !== "attachments" &&
      key !== "coverImage" &&
      data[key] !== undefined &&
      data[key] !== null
    ) {
      formData.append(key, data[key]);
    }
  });

  const response = await fetchInstance("/special-files", {
    method: "POST",
    body: formData,
    // FormData kullanırken Content-Type header'ı ekleme, browser otomatik ekler
  });

  // Hata durumunu kontrol et
  if (
    response?.statusCode &&
    response.statusCode !== 200 &&
    response.statusCode !== 201
  ) {
    const error = response.message || "Özel dosya oluşturulamadı";
    throw new Error(error);
  }

  return response;
};

/**
 * Özel dosya güncelleme fonksiyonu
 * @param {string} id - Dosya ID
 * @param {Object} data - Form data
 */
export const updateSpecialFile = async (id, data) => {
  // FormData oluştur
  const formData = new FormData();

  // coverImage File ise ekle, boş string ise silme işareti
  if (data.coverImage instanceof File) {
    formData.append("coverImage", data.coverImage);
  } else if (data.coverImage === "") {
    // Boş string görseli silmek için
    formData.append("coverImage", "");
  }

  // translations object'i JSON string'e çevir
  if (data.translations) {
    formData.append("translations", JSON.stringify(data.translations));
  }

  // Diğer alanları ekle
  Object.keys(data).forEach((key) => {
    if (
      key !== "translations" &&
      key !== "coverImage" &&
      key !== "_id" &&
      key !== "id" &&
      key !== "editHistory" &&
      key !== "lastEditedBy" &&
      key !== "createdAt" &&
      key !== "updatedAt" &&
      key !== "publishedAt" &&
      key !== "stats" &&
      key !== "author" &&
      data[key] !== undefined &&
      data[key] !== null
    ) {
      formData.append(key, data[key]);
    }
  });

  const response = await fetchInstance(`/special-files/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (response?.statusCode && response.statusCode !== 200) {
    const error = response.message || "Özel dosya güncellenemedi";
    throw new Error(error);
  }

  return response;
};

/**
 * Özel dosya silme fonksiyonu
 * @param {string} id - Dosya ID
 */
export const deleteSpecialFile = async (id) => {
  const response = await fetchInstance(`/special-files/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response?.statusCode && response.statusCode >= 400) {
    const error = response.message || "Özel dosya silinemedi";
    throw new Error(error);
  }

  return { success: true };
};

/**
 * Tüm özel dosyaları getir
 */
export const getSpecialFiles = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/special-files?${queryParams}` : "/special-files";

  const response = await fetchInstance(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};
