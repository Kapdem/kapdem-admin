"use server";

import { fetchInstance } from "@/utils/fetch";
import { uploadToSignedURL } from "@/lib/admin/action";

export const updateEvent = async (eventId, eventData) => {
  let coverImageUrl = eventData.coverImage;

  // Eğer coverImage bir File ise S3'e yükle
  if (
    eventData.coverImage &&
    typeof eventData.coverImage !== "string" &&
    eventData.coverImage instanceof File
  ) {
    const fileType = eventData.coverImage.type.startsWith("image/")
      ? "image"
      : "other";
    const uploadResult = await uploadToSignedURL(
      eventData.coverImage,
      fileType,
    );
    if (uploadResult && uploadResult.url) {
      coverImageUrl = uploadResult.url;
    } else {
      throw new Error("Kapak görseli yüklenemedi");
    }
  }

  const sendData = { ...eventData, coverImage: coverImageUrl };
  const response = await fetchInstance(`/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendData),
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to update event";
    throw new Error(error);
  }

  return response;
};

export const updatePost = async (id, paperData) => {
  let coverImageUrl = paperData.coverImage;

  // Eğer featuredImage bir File ise S3'e yükle
  if (
    paperData.featuredImage &&
    typeof paperData.featuredImage !== "string" &&
    paperData.featuredImage instanceof File
  ) {
    const fileType = paperData.featuredImage.type.startsWith("image/")
      ? "image"
      : "other";
    const uploadResult = await uploadToSignedURL(
      paperData.featuredImage,
      fileType,
    );
    if (uploadResult && uploadResult.url) {
      coverImageUrl = uploadResult.url;
    } else {
      throw new Error("Kapak görseli yüklenemedi");
    }
  }

  // API'ye gönderilecek veriyi hazırla
  const sendData = {
    ...paperData,
    coverImage: coverImageUrl,
  };

  // Backend tarafından yönetilen alanları temizle (API'ye gönderme)
  delete sendData.featuredImage;
  delete sendData.keepExistingImage;
  delete sendData.imageField;
  delete sendData.id;
  delete sendData._id;
  delete sendData.editHistory;
  delete sendData.lastEditedBy;
  delete sendData.createdAt;
  delete sendData.updatedAt;
  delete sendData.stats;

  const hasAudioFile = paperData.audioFile instanceof File;
  const removeAudio =
    paperData.audioFile === null || paperData.audioFile === "";
  delete sendData.audioFile;

  // Yeni ses dosyası: önce S3'e yükle, URL'yi JSON'a ekle
  if (hasAudioFile) {
    const uploadResult = await uploadToSignedURL(paperData.audioFile, "other");
    if (uploadResult && uploadResult.url) {
      sendData.audioFile = uploadResult.url;
    } else {
      throw new Error("Ses dosyası yüklenemedi");
    }
  }

  // Ses silme: audioFile: "" ile tek istekte gönder
  if (removeAudio) {
    sendData.audioFile = "";
  }

  const response = await fetchInstance(`/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sendData),
  });

  return response;
};
export const addPost = async (data) => {
  const formData = new FormData();

  formData.append("translations", JSON.stringify(data.translations));
  formData.append("status", data.status);
  formData.append("accessTier", data.accessTier);
  if (data.authorId) formData.append("authorId", data.authorId);
  formData.append("categories", JSON.stringify(data.categories));
  if (data.publishedAt) formData.append("publishedAt", data.publishedAt);

  if (data.coverImage instanceof File) {
    formData.append("coverImage", data.coverImage);
  }
  if (data.audioFile instanceof File) {
    formData.append("audioFile", data.audioFile);
  }

  const response = await fetchInstance(`/posts`, {
    method: "POST",
    body: formData,
    // Content-Type header'ı eklenmez, browser multipart/form-data olarak otomatik ayarlar
  });

  return response;
};

export const deleteParticipant = async (participantId) => {
  try {
    const response = await fetchInstance(
      `/gelecek-etkinlikler/kayit/${participantId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response;
  } catch (error) {
    console.error("Error deleting participant:", error);
    throw error;
  }
};

export const makeFeaturePost = async (id, isFeatured) => {
  try {
    const response = await fetchInstance(`/posts/${id}/feature`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isFeatured }),
    });
    console.log("Feature status updated:", response);

    return response;
  } catch (error) {
    console.error("Error updating featured status:", error);
    throw error;
  }
};

export const unmakeFeaturePost = async (id) => {
  try {
    const response = await fetchInstance(`/posts/${id}/unfeature`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating featured status:", error);
    throw error;
  }
};

export const makeEditorsPickPost = async (id, isEditorsPick) => {
  try {
    const response = await fetchInstance(`/posts/editor-pick/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isEditorsPick }),
    });
    console.log("Editor's Pick status updated:", response);

    return response;
  } catch (error) {
    console.error("Error updating Editor's Pick status:", error);
    throw error;
  }
};

export const unmakeEditorsPickPost = async (id) => {
  try {
    const response = await fetchInstance(`/posts/editor-unpick/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating Editor's Pick status:", error);
    throw error;
  }
};
