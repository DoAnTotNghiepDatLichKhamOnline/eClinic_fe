import axiosClient from "@/utils/axiosClient";
import type { ApiResponse } from "@/types/common.type";
import type {
  CapNhatHoSoRequest,
  DoiMatKhauRequest,
  DoiEmailRequest,
  HoSoCaNhanResponse,
  PhienDangNhapResponse,
  YeuCauDoiEmailResponse,
} from "@/types/auth.type";

export const userProfileService = {
  getHoSoCaNhan: async () => {
    const res = await axiosClient.get<ApiResponse<HoSoCaNhanResponse>>("/api/users/me");
    return res.data;
  },

  capNhatHoSo: async (data: CapNhatHoSoRequest) => {
    const res = await axiosClient.put<ApiResponse<HoSoCaNhanResponse>>("/api/users/me", data);
    return res.data;
  },

  capNhatNgonNgu: async (ngonNgu: "VI" | "EN") => {
    const res = await axiosClient.put<ApiResponse<HoSoCaNhanResponse>>("/api/users/me/language", { ngonNgu });
    return res.data;
  },

  doiMatKhau: async (data: DoiMatKhauRequest) => {
    const res = await axiosClient.put<ApiResponse<void>>("/api/users/me/change-password", data);
    return res.data;
  },

  // Avatar
  taiLenAnhDaiDien: async (file: File | Blob) => {
    const formData = new FormData();
    formData.append("anh", file);
    const res = await axiosClient.post<ApiResponse<HoSoCaNhanResponse>>("/api/users/me/avatar", formData);
    return res.data;
  },

  xoaAnhDaiDien: async () => {
    const res = await axiosClient.delete<ApiResponse<HoSoCaNhanResponse>>("/api/users/me/avatar");
    return res.data;
  },

  // Phiên đăng nhập
  getDanhSachPhienDangNhap: async () => {
    const res = await axiosClient.get<ApiResponse<PhienDangNhapResponse[]>>("/api/users/me/sessions");
    return res.data;
  },

  xoaPhienDangNhap: async (id: string) => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/api/users/me/sessions/${id}`);
    return res.data;
  },

  xoaTatCaPhienKhac: async () => {
    const res = await axiosClient.delete<ApiResponse<number>>("/api/users/me/sessions");
    return res.data;
  },

  // Đổi email
  yeuCauDoiEmail: async (data: DoiEmailRequest) => {
    const res = await axiosClient.post<ApiResponse<YeuCauDoiEmailResponse>>("/api/users/me/change-email", data);
    return res.data;
  },

  layYeuCauDoiEmailDangCho: async () => {
    const res = await axiosClient.get<ApiResponse<YeuCauDoiEmailResponse>>("/api/users/me/change-email");
    return res.data;
  },

  huyYeuCauDoiEmail: async () => {
    const res = await axiosClient.delete<ApiResponse<void>>("/api/users/me/change-email");
    return res.data;
  },
};

export default userProfileService;