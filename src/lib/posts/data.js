"use server";

import { fetchInstance } from "@/utils/fetch";

export const getAllPosts = async (options = {}) => {
  const { page = 1, limit = 50 } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetchInstance(`/admin/posts?${params.toString()}`, {
    method: "GET",
    keepDataWrapper: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const posts = Array.isArray(response?.data) ? response.data : [];

  // "videolar" ve "podcast" içeren kategorileri hariç tut
  const filteredPosts = posts.filter(
    (post) =>
      !post.categories?.includes("videolar") &&
      !post.categories?.includes("podcast"),
  );

  return {
    data: filteredPosts,
    total: Number(response?.total ?? filteredPosts.length),
    page: Number(response?.page ?? page),
    limit: Number(response?.limit ?? limit),
  };
};

export const getPostById = async (id) => {
  try {
    // Admin paneli için admin endpoint'ini kullan (tüm translations ve status'ları getirir)
    const response = await fetchInstance(`/admin/posts/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
};

export const getPostByCategory = async (category) => {
  try {
    const response = await fetchInstance(`/posts/category/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    throw error;
  }
};

export const getAllEvents = async (options = {}) => {
  try {
    const { page = 1, limit = 1000, status, search } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await fetchInstance(`/events/admin/all?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await fetchInstance(`/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
};

export const getEventsParticipants = async (id) => {
  try {
    const response = await fetchInstance(
      `/gelecek-etkinlikler/etkinlik/${id}/kayitlar`,
      {
        method: "GET",
      },
    );

    return response;
  } catch (error) {
    console.error("Error fetching event participants:", error);
    throw error;
  }
};

export const upcomingEvents = async () => {
  try {
    const response = await fetchInstance("/posts/upcoming-events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

/**
 * @param {Record<string, any>} [submission]
 * @returns {Record<string, any>}
 */
const normalizePublicSubmit = (submission = {}) => {
  const categorySlug =
    submission.category ??
    submission.categorySlug ??
    submission.categoryId ??
    submission.category_name ??
    submission.categoryName ??
    submission.categoryValue ??
    (Array.isArray(submission.categories)
      ? submission.categories[0]
      : undefined);

  const categoryLabel =
    submission.categoryLabel ??
    submission.category_name ??
    submission.categoryName ??
    submission.category_display ??
    submission.categoryDisplay ??
    (typeof submission.category === "object" && submission.category
      ? submission.category.name || submission.category.label
      : undefined) ??
    categorySlug ??
    "";

  return {
    ...submission,
    category: categorySlug ?? "",
    categoryLabel,
  };
};

/** @returns {Promise<Record<string, any>[]>} */
export const publicSubmitList = async () => {
  const response = await fetchInstance("/public-submit/admin/list");
  const submissions = Array.isArray(response?.submissions)
    ? response.submissions
    : Array.isArray(response)
      ? response
      : [];

  return submissions.map(normalizePublicSubmit);
};

/** @param {string} id @returns {Promise<Record<string, any> | null>} */
export const publicSubmitById = async (id) => {
  try {
    const response = await fetchInstance(`/public-submit/admin/${id}`, {
      method: "GET",
    });

    return normalizePublicSubmit(response);
  } catch (error) {
    console.error("Error fetching public submit by ID:", error);
    return null;
  }
};

export const confirmPublicStatus = async (id, status) => {
  try {
    const response = await fetchInstance(`/public-submit/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });
    return response;
  } catch (error) {
    console.error("Error confirming public submit:", error);
    return null;
  }
};
