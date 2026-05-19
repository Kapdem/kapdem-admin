"use server";
import { fetchInstance } from "@/utils/fetch";

export const getMailsData = async () => {
  const response = await fetchInstance("/contact");
  return response;
};

export const deleteMail = async (id) => {
  if (!id) {
    throw new Error("Geçersiz mail kimliği");
  }

  const response = await fetchInstance(`/contact/${id}`, {
    method: "DELETE",
  });

  if (response?.statusCode && response.statusCode >= 400) {
    throw new Error(response.message || "Mail silinemedi");
  }

  return { success: true };
};
