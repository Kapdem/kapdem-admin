"use server";

import { fetchInstance } from "@/utils/fetch";

export const getAllSpecialFile = async () => {
  const res = await fetchInstance("/special-files", {
    method: "GET",
  });

  return res.specialFiles;
};

export const getSpecialFileById = async (id) => {
  // Önce admin endpoint'i dene (status/tier filtre yok)
  const adminRes = await fetchInstance(`/special-files/admin/${id}`, {
    method: "GET",
  });

  // Başarılıysa admin cevabını döndür
  if (adminRes && adminRes._id) {
    return adminRes;
  }

  console.warn(
    "[special-files] admin endpoint başarısız, public endpoint deneniyor:",
    adminRes,
  );

  // Fallback: public endpoint (eski backend ile uyumluluk için)
  const publicRes = await fetchInstance(`/special-files/${id}`, {
    method: "GET",
  });

  if (publicRes && publicRes._id) {
    return publicRes;
  }

  console.error(
    "[special-files] public endpoint de başarısız:",
    publicRes,
  );

  return publicRes;
};
