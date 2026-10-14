import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// 1. Storage Access Token in memory
let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

const getRequestLanguage = () => {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("eclinic_language") === "vi" ? "vi" : "en";
};

// 2. Init Axios Client config
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080", // Trỏ tới API Gateway (cổng 8080)
  withCredentials: true, // Bắt buộc để trình duyệt tự động đính kèm cookie refresh token (eclinic_rt)
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Request Interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers["Accept-Language"] = getRequestLanguage();
      const isPublicAuthRequest = config.url?.startsWith('/api/auth/');
      if (memoryAccessToken && config.headers && !isPublicAuthRequest) {
      config.headers["Authorization"] = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Support auto refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// 4. Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/auth/refresh-token")) {
        setAccessToken(null);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call APi to refresh token
        const response = await axios.post(
          `${axiosClient.defaults.baseURL}/api/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: { "Accept-Language": getRequestLanguage() },
          },
        );

        const newToken = response.data.duLieu?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          isRefreshing = false;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
