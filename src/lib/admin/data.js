"use server";

import { fetchInstance } from "@/utils/fetch";

export const getAdminData = async () => {
  const response = await fetchInstance("/admin/stats");
  return response;
};

export const getEditorsData = async () => {
  const response = await fetchInstance("/admin/editors");
  return response;
};

export const getProfileData = async () => {
  const response = await fetchInstance("/auth/profile");
  return response;
};

export const getCategoriesList = async () => {
  const response = await fetchInstance("/posts/categories/list");
  return response;
};

export const getAllUsers = async () => {
  const response = await fetchInstance("/admin/users");
  return response;
};

export const getUserById = async (id) => {
  const response = await fetchInstance(`/admin/users/${id}`);
  return response;
};

export const availableAuthors = async () => {
  const response = await fetchInstance("/admin/users/available-authors");
  return response;
};

export const getTeamMembers = async () => {
  const response = await fetchInstance("/admin/team");
  return response;
};

export const getAllNewsletters = async () => {
  const response = await fetchInstance("/newsletter/all");
  return response;
};

export const getAllStats = async () => {
  const response = await fetchInstance(
    "/admin/analytics/view-stats?period=week",
  );
  return response;
};

export const getViewStats = async (period = "all") => {
  const response = await fetchInstance(
    `/admin/analytics/view-stats?period=${period}`,
  );
  return response;
};
