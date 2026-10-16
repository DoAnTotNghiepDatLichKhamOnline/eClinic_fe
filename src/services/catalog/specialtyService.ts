import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  ChuyenKhoaResponse,
  ChuyenKhoaRequest,
  GetChuyenKhoaParams,
} from "@/types/catalog.type";

export const specialtyService = {
  // Public & tra cứu
  getDanhSachChuyenKhoa: async (params?: GetChuyenKhoaParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<ChuyenKhoaResponse>>>(
      "/api/catalog/chuyen-khoa",
      { params },
    );
    return res.data;
  },

  getChiTietChuyenKhoa: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<ChuyenKhoaResponse>>(
      `/api/catalog/chuyen-khoa/${id}`,
    );
    return res.data;
  },

  // Quản trị viên
  getDanhSachChuyenKhoaQuanTri: async (params?: GetChuyenKhoaParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<ChuyenKhoaResponse>>>(
      "/api/catalog/quan-tri/chuyen-khoa",
      { params },
    );
    return res.data;
  },

  taoChuyenKhoa: async (data: ChuyenKhoaRequest) => {
    const res = await axiosClient.post<ApiResponse<ChuyenKhoaResponse>>(
      "/api/catalog/chuyen-khoa",
      data,
    );
    return res.data;
  },

  capNhatChuyenKhoa: async (id: number, data: ChuyenKhoaRequest) => {
    const res = await axiosClient.put<ApiResponse<ChuyenKhoaResponse>>(
      `/api/catalog/chuyen-khoa/${id}`,
      data,
    );
    return res.data;
  },

  xoaChuyenKhoa: async (id: number) => {
    const res = await axiosClient.delete<ApiResponse<void>>(
      `/api/catalog/chuyen-khoa/${id}`,
    );
    return res.data;
  },
};

export default specialtyService;