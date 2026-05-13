import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const prepareHeaders = (headers) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return { ...defaultHeaders, ...headers };
};

export const fetchInstance = async (url, options = {}) => {
  const { keepDataWrapper = false, ...requestOptions } = options;

  // cookies() is a dynamic server API; await it before using its value
  const cookieStorage = await cookies();
  let authCookie = cookieStorage.get && cookieStorage.get("Authentication");
  let languageCookie = cookieStorage.get && cookieStorage.get("NEXT_LOCALE");

  // Check if we're sending FormData, and if so, don't set Content-Type
  // The browser will set the appropriate Content-Type with boundary for FormData
  const isFormData = requestOptions.body instanceof FormData;

  const headers = prepareHeaders({
    role: "USER",
    ...requestOptions.headers,
    ...(authCookie && { Authorization: `${authCookie.value}` }),
    ...(languageCookie && { "Accept-Language": `${languageCookie.value}` }),
  });

  // Remove Content-Type for FormData requests
  if (isFormData && headers["Content-Type"]) {
    delete headers["Content-Type"];
  }

  let response = await fetch(`${BASE_URL}${url}`, {
    ...requestOptions,
    headers,
    credentials: "include",
  });

  // Check if response is empty or not JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      const data = await response.json();

      // API yanıtını kontrol et

      // Eğer bir 'data' alanı varsa doğrudan onu döndür
      if (data && data.data && !keepDataWrapper) {
        return data.data;
      }

      return data;
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return {
        status: response.status,
        statusCode: response.status,
        message: "Unable to parse JSON response",
      };
    }
  } else {
    // For non-JSON responses (like form data responses)
    return {
      status: response.status,
      statusCode: response.status,
      message: await response.text(),
      isSuccess: response.ok,
    };
  }
};
