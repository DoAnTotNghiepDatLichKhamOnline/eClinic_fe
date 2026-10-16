import axiosClient from "@/utils/axiosClient";
import type { ApiResponse, PageResponse } from "@/types/common.type";
import type {
  ThuocResponse,
  ThuocRequest,
  GetThuocParams,
} from "@/types/catalog.type"; // Sau này có thể chuyển sang @/types/medical.type

export const medicineService = {
  getDanhSachThuocQuanTri: async (params?: GetThuocParams) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<ThuocResponse>>>(
      "/api/medical/quan-tri/thuoc",
      { params },
    );
    return res.data;
  },

  taoThuoc: async (data: ThuocRequest) => {
    const res = await axiosClient.post<ApiResponse<ThuocResponse>>(
      "/api/medical/quan-tri/thuoc",
      data,
    );
    return res.data;
  },

  capNhatThuoc: async (id: number, data: ThuocRequest) => {
    const res = await axiosClient.put<ApiResponse<ThuocResponse>>(
      `/api/medical/quan-tri/thuoc/${id}`,
      data,
    );
    return res.data;
  },

  xacMinhThuoc: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<ThuocResponse>>(
      `/api/medical/quan-tri/thuoc/${id}/xac-minh`,
    );
    return res.data;
  },

  ngungDungThuoc: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<ThuocResponse>>(
      `/api/medical/quan-tri/thuoc/${id}/ngung-dung`,
    );
    return res.data;
  },

  dungLaiThuoc: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<ThuocResponse>>(
      `/api/medical/quan-tri/thuoc/${id}/dung-lai`,
    );
    return res.data;
  },
};

export default medicineService;