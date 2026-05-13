"use server";

import { fetchInstance } from "@/utils/fetch";

export const getAllSpecialFile = async () => {
  const res = await fetchInstance("/special-files", {
    method: "GET",
  });

  return res.specialFiles;
};

export const getSpecialFileById = async (id) => {
  const res = await fetchInstance(`/special-files/${id}`, {
    method: "GET",
  });

  return res;
};
