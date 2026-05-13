"use server";
import { fetchInstance } from "@/utils/fetch";

export const getMailsData = async () => {
  const response = await fetchInstance("/contact");
  return response;
};
