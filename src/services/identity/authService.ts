import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";
import type {
  DangKyRequest,
  XacThucEmailRequest,
  GuiLaiXacThucRequest,
  DangNhapRequest,
  DangNhapGoogleRequest,
  DatMatKhauLanDauRequest,
  PhienDangNhapRequest,
  QuenMatKhauRequest,
  DatLaiMatKhauRequest,
  TaiKhoanResponse,
  DangNhapResponse,
} from "@/types/auth.type";

export const authService = {
  dangKy: async (data: DangKyRequest) => {
    const res = await axiosClient.post<ApiResponse<TaiKhoanResponse>>("/api/auth/register", data);
    return res.data;
  },

  xacThucEmail: async (data: XacThucEmailRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/verify-email", data);
    return res.data;
  },

  guiLaiXacThuc: async (data: GuiLaiXacThucRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/resend-verification", data);
    return res.data;
  },

  dangNhap: async (data: DangNhapRequest) => {
    const res = await axiosClient.post<ApiResponse<DangNhapResponse>>("/api/auth/login", data);
    return res.data;
  },

  dangNhapGoogle: async (data: DangNhapGoogleRequest) => {
    const res = await axiosClient.post<ApiResponse<DangNhapResponse>>("/api/auth/google", data);
    return res.data;
  },

  datMatKhauLanDau: async (data: DatMatKhauLanDauRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/first-password", data);
    return res.data;
  },

  lamMoiToken: async (data?: PhienDangNhapRequest) => {
    const res = await axiosClient.post<ApiResponse<DangNhapResponse>>("/api/auth/refresh-token", data);
    return res.data;
  },

  dangXuat: async (data?: PhienDangNhapRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/logout", data);
    return res.data;
  },

  quenMatKhau: async (data: QuenMatKhauRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/forgot-password", data);
    return res.data;
  },

  datLaiMatKhau: async (data: DatLaiMatKhauRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/reset-password", data);
    return res.data;
  },

  xacNhanDoiEmail: async (data: XacThucEmailRequest) => {
    const res = await axiosClient.post<ApiResponse<void>>("/api/auth/confirm-email-change", data);
    return res.data;
  },
};

export default authService;