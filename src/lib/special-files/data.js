"use server";

import { fetchInstance } from "@/utils/fetch";

export const getAllSpecialFile = async () => {
  const res = await fetchInstance("/special-files", {
    method: "GET",
  });

  return res.specialFiles;
};

export const getSpecialFileById = async (id) => {
  // Admin endpoint kullanılıyor — status/tier filtre yok,
  // draft/pending dahil tüm özel dosyalar düzenlenebilir.
  const res = await fetchInstance(`/special-files/admin/${id}`, {
    method: "GET",
  });

  return res;
};
