import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. Lưu trữ Access Token trong bộ nhớ (không lưu vào localStorage để bảo mật theo tài liệu)
let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

// 2. Khởi tạo cấu hình Axios Client
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', // Trỏ tới API Gateway (cổng 8080)
  withCredentials: true, // Bắt buộc để trình duyệt tự động đính kèm cookie refresh token (eclinic_rt)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Tự động gắn Bearer Token vào header trước mỗi request cần đăng nhập
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Biến hỗ trợ xử lý hàng đợi khi đang gọi refresh token đồng thời
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

// 4. Response Interceptor: Xử lý tự động làm mới token khi gặp lỗi 401 (CHUA_DANG_NHAP)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Kiểm tra nếu response trả về lỗi 401 và request chưa được thử lại lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu chính API refresh-token bị lỗi 401 nghĩa là phiên đã thực sự hết hạn -> Đăng xuất
      if (originalRequest.url?.includes('/api/auth/refresh-token')) {
        setAccessToken(null);
        window.location.href = '/dang-nhap';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
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
        // Gọi API làm mới phiên (Refresh token được tự động gửi kèm qua cookie HttpOnly eclinic_rt)
        const response = await axios.post(
          `${axiosClient.defaults.baseURL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.duLieu?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          isRefreshing = false;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessToken(null);
        // Nếu refresh token không hợp lệ (lỗi 401 PHIEN_DANG_NHAP_KHONG_HOP_LE) -> chuyển hướng về trang đăng nhập
        window.location.href = '/dang-nhap';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;