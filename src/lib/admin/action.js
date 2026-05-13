"use server";

import { fetchInstance } from "@/utils/fetch";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import randomBytes from "randombytes";

const generateFileName = () => {
  const hex = randomBytes(12).toString("hex").toUpperCase();

  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
};
export async function getSignedURL(filename, type) {
  const s3 = new S3Client({
    region: "eu-central-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const putObjectCommand = new PutObjectCommand({
    Bucket: "kapdem",
    Key: filename,
  });
  const signedURL = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 36000,
  });
  return signedURL;
}
export const uploadToSignedURL = async (file, fileType) => {
  const fileName = generateFileName();
  try {
    const signedUrl = await getSignedURL(fileName, fileType);
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!response.ok) {
      console.error(`Failed to upload ${fileName} to ${fileType}`);
      return null;
    }
    // S3 public URL oluştur

    const url = `https://kapdem.s3.eu-central-1.amazonaws.com/${fileName}`;
    return { fileName, url };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const upgradeTier = async (id) => {
  const response = await fetchInstance(`/admin/posts/${id}/upgrade-tier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  return response;
};

export const downgradeTier = async (id) => {
  const response = await fetchInstance(`/admin/posts/${id}/downgrade-tier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return response;
};

export const createEditor = async (data) => {
  const response = await fetchInstance(`/admin/editors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // If statusCode is not 201 (created), throw with message from response
  if (response.statusCode && response.statusCode !== 201) {
    const error = response.message || "Failed to create editor";
    throw new Error(error);
  }

  return response;
};

export const editEditor = async (id, data) => {
  const response = await fetchInstance(`/admin/editors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to edit editor";
    throw new Error(error);
  }

  return response;
};

export const getEditorById = async (id) => {
  const response = await fetchInstance(`/users/editors-by-ids?ids=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to get editor";
    throw new Error(error);
  }

  return response;
};

export const deleteEditor = async (id) => {
  const response = await fetchInstance(`/admin/editors/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to delete editor";
    throw new Error(error);
  }

  return response;
};

export const addPost = async (paperData) => {
  let coverImageUrl = paperData.coverImage;
  // Eğer coverImage bir File ise S3'e yükle
  if (
    paperData.coverImage &&
    typeof paperData.coverImage !== "string" &&
    paperData.coverImage instanceof File
  ) {
    const fileType = paperData.coverImage.type.startsWith("image/")
      ? "image"
      : "other";
    const uploadResult = await uploadToSignedURL(
      paperData.coverImage,
      fileType,
    );
    if (uploadResult && uploadResult.url) {
      coverImageUrl = uploadResult.url;
    } else {
      throw new Error("Kapak görseli yüklenemedi");
    }
  }

  let audioFileUrl = undefined;
  // Eğer audioFile bir File ise S3'e yükle
  if (paperData.audioFile && paperData.audioFile instanceof File) {
    const uploadResult = await uploadToSignedURL(paperData.audioFile, "other");
    if (uploadResult && uploadResult.url) {
      audioFileUrl = uploadResult.url;
    } else {
      throw new Error("Ses dosyası yüklenemedi");
    }
  }

  const { audioFile, ...rest } = paperData;
  const sendData = {
    ...rest,
    coverImage: coverImageUrl,
    ...(audioFileUrl !== undefined && { audioFile: audioFileUrl }),
  };
  const response = await fetchInstance(`/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendData),
  });
  return response;
};

export const addEvent = async (eventData) => {
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
  const response = await fetchInstance(`/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendData),
  });

  if (response.statusCode && response.statusCode !== 201) {
    const error = response.message || "Failed to create event";
    throw new Error(error);
  }

  return response;
};

export const changeEditorPassword = async (id, newPassword) => {
  const response = await fetchInstance(`/admin/editors/${id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPassword }),
  });

  return response;
};

export const updateUserType = async (id, data) => {
  const response = await fetchInstance(`/admin/users/${id}/user-type`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

export const deletePublicSubmit = async (id) => {
  const response = await fetchInstance(`/public-submit/admin/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to delete public submit";
    throw new Error(error);
  }

  return response;
};

export const upgradeUserTier = async (id) => {
  const response = await fetchInstance(`/admin/users/${id}/upgrade-tier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  // Hata durumunu kontrol et
  if (response?.statusCode && response.statusCode !== 200) {
    const error = response.message || "Tier yükseltilemedi";
    throw new Error(error);
  }

  return response;
};

export const downgradeUserTier = async (id) => {
  const response = await fetchInstance(`/admin/users/${id}/downgrade-tier`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  // Hata durumunu kontrol et
  if (response?.statusCode && response.statusCode !== 200) {
    const error = response.message || "Tier düşürülemedi";
    throw new Error(error);
  }

  return response;
};

export const createUser = async (data) => {
  const response = await fetchInstance(`/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.statusCode && response.statusCode !== 201) {
    const error = response.message || "Failed to create user";
    throw new Error(error);
  }
  return response;
};

export const updateUser = async (id, data) => {
  try {
    let sendData = {};
    let photoFile = null;

    if (data instanceof FormData) {
      // Extract fields from FormData
      sendData = {
        username: data.get("username") || "",
        firstName: data.get("firstName") || "",
        lastName: data.get("lastName") || "",
        email: data.get("email") || "",
        institution: data.get("institution") || "",
        title: data.get("title") || "",
        profession: data.get("profession") || "",
        role: data.get("role") || "FREE",
        userType: data.get("userType") || "REGULAR",
        about: data.get("about") || "",
        isActive: data.get("isActive") === "true",
      };

      const photo = data.get("photo");
      if (photo instanceof File && photo.size > 0) {
        photoFile = photo;
      } else if (typeof photo === "string" && photo.length > 0) {
        sendData.photo = photo;
      }
    } else {
      // Handle plain object
      const { photo, ...others } = data;
      sendData = {
        ...others,
        username: others.username || "",
        firstName: others.firstName || "",
        lastName: others.lastName || "",
        email: others.email || "",
      };
      if (photo instanceof File && photo.size > 0) {
        photoFile = photo;
      } else if (typeof photo === "string" && photo.length > 0) {
        sendData.photo = photo;
      }
    }

    // Handle photo upload to S3 if we have a new File
    if (photoFile) {
      const uploadResult = await uploadToSignedURL(photoFile, "image");
      if (uploadResult && uploadResult.url) {
        sendData.photo = uploadResult.url;
      } else {
        throw new Error("Profil fotoğrafı yüklenemedi");
      }
    }

    const response = await fetchInstance(`/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendData),
    });

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to edit user";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("updateUser error:", error);
    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Kullanıcı güncellenirken bir hata oluştu");
    }
  }
};

export const deleteUser = async (id) => {
  const response = await fetchInstance(`/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to delete user";
    throw new Error(error);
  }

  return response;
};

export const resetUserPassword = async (id, newPassword) => {
  const response = await fetchInstance(`/admin/users/${id}/reset-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPassword }),
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to reset user password";
    throw new Error(error);
  }

  return response;
};

export const addTeamMember = async (data) => {
  try {
    let response;

    // If data is FormData (contains file), use FormData
    if (data instanceof FormData) {
      response = await fetchInstance(`/admin/team`, {
        method: "POST",
        body: data, // Don't set Content-Type header, let browser set it for FormData
      });
    } else {
      // If data is plain object, use JSON
      response = await fetchInstance(`/admin/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

    // Backend'den 201 status code dönüyor, o yüzden kontrol etmek daha iyi
    if (response.statusCode && response.statusCode !== 201) {
      const error = response.message || "Failed to add team member";
      throw new Error(error);
    }

    // Success response döndür
    return response;
  } catch (error) {
    console.error("addTeamMember error:", error);

    // Error handling iyileştirme - daha detaylı hata mesajları
    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Ekip üyesi eklenirken beklenmedik bir hata oluştu");
    }
  }
};

export const getTeamMembers = async () => {
  try {
    const response = await fetchInstance(`/admin/team`, {
      method: "GET",
    });

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to get team members";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("getTeamMembers error:", error);

    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Ekip üyeleri getirilirken beklenmedik bir hata oluştu");
    }
  }
};

export const getTeamMemberById = async (id) => {
  try {
    const response = await fetchInstance(`/admin/team/${id}`, {
      method: "GET",
    });

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to get team member";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("getTeamMemberById error:", error);

    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Ekip üyesi getirilirken beklenmedik bir hata oluştu");
    }
  }
};

export const updateTeamMember = async (id, data) => {
  try {
    let response;

    // If data is FormData (contains file), use FormData
    if (data instanceof FormData) {
      response = await fetchInstance(`/admin/team/${id}`, {
        method: "PUT",
        body: data, // Don't set Content-Type header, let browser set it for FormData
      });
    } else {
      // If data is plain object, use JSON
      response = await fetchInstance(`/admin/team/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to update team member";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("updateTeamMember error:", error);

    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Ekip üyesi güncellenirken beklenmedik bir hata oluştu");
    }
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const response = await fetchInstance(`/admin/team/${id}`, {
      method: "DELETE",
    });

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to delete team member";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("deleteTeamMember error:", error);

    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Ekip üyesi silinirken beklenmedik bir hata oluştu");
    }
  }
};

export const toggleTeamMemberActive = async (id) => {
  try {
    const response = await fetchInstance(`/admin/team/${id}/toggle-active`, {
      method: "PUT",
    });

    if (response.statusCode && response.statusCode !== 200) {
      const error = response.message || "Failed to toggle team member status";
      throw new Error(error);
    }

    return response;
  } catch (error) {
    console.error("toggleTeamMemberActive error:", error);

    if (error.response && error.response.message) {
      throw new Error(error.response.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error(
        "Ekip üyesi durumu değiştirilirken beklenmedik bir hata oluştu",
      );
    }
  }
};

export const deletePost = async (postId) => {
  const response = await fetchInstance(`/admin/posts/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to delete post";
    throw new Error(error);
  }

  return response;
};

export const deleteEvent = async (eventId) => {
  const response = await fetchInstance(`/events/${eventId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode && response.statusCode !== 200) {
    const error = response.message || "Failed to delete event";
    throw new Error(error);
  }

  return response;
};
