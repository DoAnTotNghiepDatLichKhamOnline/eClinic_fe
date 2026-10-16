import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  GetTaiKhoanQuanTriParams,
  CapNhatTrangThaiTaiKhoanRequest,
  TaiKhoanQuanTriResponse,
  ChiTietTaiKhoanResponse,
} from "@/types/auth.type";

export const userAdminService = {
  getDanhSachTaiKhoanQuanTri: async (params?: GetTaiKhoanQuanTriParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<TaiKhoanQuanTriResponse>>>("/api/users", { params });
    return res.data;
  },

  getChiTietTaiKhoan: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<ChiTietTaiKhoanResponse>>(`/api/users/${id}`);
    return res.data;
  },

  capNhatTrangThaiTaiKhoan: async (id: number, data: CapNhatTrangThaiTaiKhoanRequest) => {
    const res = await axiosClient.put<ApiResponse<ChiTietTaiKhoanResponse>>(`/api/users/${id}/status`, data);
    return res.data;
  },

  xoaTaiKhoan: async (id: number) => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/api/users/${id}`);
    return res.data;
  },
};

export default userAdminService;